// Upload the homepage banners (public/images/hero-car-{1,2,3}.jpg) to R2 as WebP at
// banners/hero-car-N.webp (1-year immutable cache). Verifies each copy by SHA-256.
// These keys are the default banners in lib/banners.ts. Safe to re-run.
//   node scripts/sync-banners-to-r2.mjs
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

for (const name of [".env.local", ".env"]) if (existsSync(name)) process.loadEnvFile(name);
const need = (k) => {
  if (!process.env[k]) throw new Error(`Missing ${k}`);
  return process.env[k].trim();
};
const bucket = need("R2_BUCKET_NAME");
const publicBase = need("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/+$/, "");
const s3 = new S3Client({
  region: "auto",
  forcePathStyle: true,
  endpoint: `https://${need("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: need("R2_ACCESS_KEY_ID"), secretAccessKey: need("R2_SECRET_ACCESS_KEY") },
});
const sha = (b) => createHash("sha256").update(b).digest("hex");

for (const n of [1, 2, 3]) {
  const src = `public/images/hero-car-${n}.jpg`;
  const key = `banners/hero-car-${n}.webp`;
  const body = await sharp(readFileSync(src)).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer();
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: body, ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable", Metadata: { sha256: sha(body) },
  }));
  const back = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (sha(Buffer.from(await back.Body.transformToByteArray())) !== sha(body)) throw new Error(`${key}: R2 copy differs`);
  const res = await fetch(`${publicBase}/${key}`, { method: "HEAD" });
  console.log(`${src} -> ${publicBase}/${key} (${(body.length / 1024).toFixed(0)} KB, public HTTP ${res.status}, ${res.headers.get("cache-control")})`);
}
