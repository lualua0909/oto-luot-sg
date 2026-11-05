import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2_PUBLIC_URL } from "@/lib/images/url";

/**
 * Cloudflare R2 holds every image (bucket R2_BUCKET_NAME). Browsers load images straight
 * from the public R2 domain (NEXT_PUBLIC_R2_PUBLIC_URL) and upload through presigned
 * PUT URLs. Never stream image bytes back to browsers from a route or function.
 */
export const IMAGE_CACHE = "public, max-age=31536000, immutable";

function need(k: string) {
  const v = process.env[k]?.trim();
  if (!v) throw new Error(`Thiếu ${k}.`);
  return v;
}

let client: S3Client | undefined;
function s3() {
  return (client ??= new S3Client({
    region: "auto",
    forcePathStyle: true,
    endpoint: `https://${need("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: need("R2_ACCESS_KEY_ID"), secretAccessKey: need("R2_SECRET_ACCESS_KEY") },
  }));
}
const bucket = () => need("R2_BUCKET_NAME");

export const publicUrl = (key: string) => `${R2_PUBLIC_URL}/${key}`;

/** Key of an R2 image URL, or null for any other URL. */
export function keyOf(url: string): string | null {
  if (!R2_PUBLIC_URL || !url.startsWith(`${R2_PUBLIC_URL}/`)) return null;
  return decodeURIComponent(url.slice(R2_PUBLIC_URL.length + 1).split(/[?#]/)[0]);
}

/** Browser upload: a short-lived URL the browser PUTs the file to. */
export async function presignUpload(key: string, contentType: string) {
  return getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType, CacheControl: IMAGE_CACHE }), { expiresIn: 600 });
}

export async function headObject(key: string) {
  return s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key })).catch(() => null);
}

/** Reads an object for server-side processing (e.g. compressing an upload), never to serve it. */
export async function readObject(key: string) {
  const res = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  return Buffer.from(await res.Body!.transformToByteArray());
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType, CacheControl: IMAGE_CACHE }));
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function listObjects() {
  const out: { key: string; size: number; uploadedAt: string }[] = [];
  let token: string | undefined;
  do {
    const page = await s3().send(new ListObjectsV2Command({ Bucket: bucket(), ContinuationToken: token }));
    for (const o of page.Contents ?? []) if (o.Key) out.push({ key: o.Key, size: o.Size ?? 0, uploadedAt: o.LastModified?.toISOString() ?? "" });
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return out;
}
