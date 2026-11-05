// One-time copy of every Vercel Blob object into Cloudflare R2 (key = the path of the
// blob's public URL, including Vercel's random suffix, so stored URLs map 1:1;
// 1-year browser cache). Verifies size and SHA-256 of each copy. Safe to re-run.
//   node scripts/migrate-blob-to-r2.mjs
// Needs BLOB_READ_WRITE_TOKEN (source) and R2_* (target) in .env / .env.local.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

for (const name of [".env.local", ".env"]) if (existsSync(name)) process.loadEnvFile(name);
const need = (k) => {
  if (!process.env[k]) throw new Error(`Missing ${k}`);
  return process.env[k];
};
const token = need("BLOB_READ_WRITE_TOKEN");
const bucket = need("R2_BUCKET_NAME");
const s3 = new S3Client({
  region: "auto",
  forcePathStyle: true,
  endpoint: `https://${need("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: need("R2_ACCESS_KEY_ID"), secretAccessKey: need("R2_SECRET_ACCESS_KEY") },
});
const sha = (b) => createHash("sha256").update(b).digest("hex");

const blobs = [];
let cursor;
do {
  const res = await fetch(`https://blob.vercel-storage.com?limit=1000${cursor ? `&cursor=${cursor}` : ""}`, { headers: { authorization: `Bearer ${token}` } });
  const page = await res.json();
  blobs.push(...page.blobs);
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

let copied = 0, skipped = 0;
const failed = [];
const queue = [...blobs];
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let b = queue.shift(); b; b = queue.shift()) {
    // The list API's `pathname` drops the random suffix that the public URL (and our data) has.
    b = { ...b, pathname: decodeURIComponent(new URL(b.url).pathname.slice(1)) };
    try {
      const existing = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: b.pathname })).catch(() => null);
      if (existing && existing.ContentLength === b.size) { skipped++; continue; }
      const res = await fetch(b.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Blob HTTP ${res.status}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length !== b.size) throw new Error("size mismatch");
      const contentType = res.headers.get("content-type") || "application/octet-stream";
      await s3.send(new PutObjectCommand({
        Bucket: bucket, Key: b.pathname, Body: bytes, ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable", Metadata: { sha256: sha(bytes) },
      }));
      const back = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: b.pathname }));
      const check = Buffer.from(await back.Body.transformToByteArray());
      if (sha(check) !== sha(bytes)) throw new Error("R2 copy differs");
      copied++;
    } catch (error) {
      failed.push({ pathname: b.pathname, error: error.message });
    }
  }
}));
console.log(`blobs ${blobs.length} · copied ${copied} · already in R2 ${skipped} · failed ${failed.length}`);
if (failed.length) {
  console.error(failed.slice(0, 20));
  process.exitCode = 1;
}
