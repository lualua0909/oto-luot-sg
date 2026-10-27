import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { list, head, put } from "@vercel/blob";
import sharp from "sharp";
const T=80*1024, MAXD=1920, MINQ=45, MAXQ=84;
const dir=process.argv[2];
const env=await fs.readFile(".env.local","utf8");
const token=env.match(/^BLOB_READ_WRITE_TOKEN\s*=\s*(.*)$/m)[1].trim().replace(/^(["'])(.*)\1$/,"$2");
const sha=b=>createHash("sha256").update(b).digest("hex");
async function enc(input){
  const m=await sharp(input).metadata();
  let le=Math.min(MAXD,Math.max(m.width,m.height));
  for(let a=0;a<12;a++){
    const e=q=>sharp(input).rotate().resize({width:le,height:le,fit:"inside",withoutEnlargement:true}).webp({quality:q,effort:4}).toBuffer({resolveWithObject:true});
    let best=await e(MAXQ); if(best.data.length<=T) return best;
    const lo=await e(MINQ);
    if(lo.data.length<=T){best=lo;let l=MINQ,h=MAXQ;for(let i=0;i<6;i++){const q=Math.floor((l+h+1)/2);if(q===l)break;const c=await e(q);if(c.data.length<=T){best=c;l=q}else h=q-1;}return best;}
    const s=Math.max(0.7,Math.min(0.9,Math.sqrt(T/lo.data.length)*0.95));le=Math.max(1,Math.min(le-1,Math.floor(le*s)));
  }
  throw new Error("cannot compress");
}
const all=[];let cursor;
do{const p=await list({prefix:"cars/",limit:1000,cursor,token});all.push(...p.blobs);cursor=p.hasMore?p.cursor:undefined;}while(cursor);
const big=all.filter(b=>b.size>T);
console.log("to fix",big.length);
await fs.mkdir(path.join(dir,"original","cars"),{recursive:true});
const results=[];let next=0,done=0;
async function worker(){
  while(next<big.length){
    const b=big[next++];
    if(!b.pathname.startsWith("cars/")||b.pathname.includes(".."))throw new Error("unsafe "+b.pathname);
    const h0=await head(b.url,{token});
    const r=await fetch(b.url+"?bk="+Date.now(),{headers:{"Cache-Control":"no-cache"}});
    const orig=Buffer.from(await r.arrayBuffer());
    if(orig.length!==h0.size)throw new Error("size mismatch "+b.pathname);
    await fs.writeFile(path.join(dir,"original",b.pathname),orig,{flag:"wx"});
    const out=await enc(orig);
    if(out.data.length>T||Math.max(out.info.width,out.info.height)>MAXD)throw new Error("bad "+b.pathname);
    const up=await put(b.pathname,out.data,{access:"public",token,contentType:"image/webp",addRandomSuffix:false,allowOverwrite:true,ifMatch:h0.etag});
    if(up.url!==b.url)throw new Error("url changed "+b.pathname);
    const h1=await head(b.url,{token});
    if(h1.size!==out.data.length)throw new Error("verify failed "+b.pathname);
    results.push({pathname:b.pathname,url:b.url,oldBytes:orig.length,oldSha:sha(orig),newBytes:out.data.length,w:out.info.width,h:out.info.height});
    if(++done%10===0||done===big.length)console.log("done",done);
  }
}
try{await Promise.all([1,2,3,4].map(worker));}
finally{await fs.writeFile(path.join(dir,"results.json"),JSON.stringify(results,null,1));}
console.log(JSON.stringify({fixed:results.length,oldBytes:results.reduce((n,r)=>n+r.oldBytes,0),newBytes:results.reduce((n,r)=>n+r.newBytes,0),maxNew:Math.max(...results.map(r=>r.newBytes))}));
