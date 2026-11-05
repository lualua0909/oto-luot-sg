import type { CarImage } from "@/lib/types";
import { idToken } from "@/lib/store/session";
import { toWebp } from "./webp";

/**
 * Uploads go straight from the browser to Cloudflare R2 through a presigned PUT URL
 * (no request-size limit from Vercel). Car photos are then compressed on the server
 * (/api/upload/optimize); other folders are converted to WebP in the browser first.
 */
const IMAGE_CACHE = "public, max-age=31536000, immutable";

function put(url: string, file: Blob, contentType: string, onProgress?: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("Cache-Control", IMAGE_CACHE);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Tải ảnh lên R2 thất bại (HTTP ${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Không kết nối được tới kho ảnh R2."));
    xhr.send(file);
  });
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await idToken()}` },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok || !json) throw new Error(json?.error ?? `HTTP ${res.status}`);
  return json;
}

/** Upload one image under `folder/`; returns its public R2 URL and key (kept for deleting). */
export async function uploadImage(
  file: File,
  folder: "cars" | "news" | "brands",
  onProgress?: (pct: number) => void,
): Promise<CarImage> {
  const isCar = folder === "cars";
  const upload = isCar ? file : await toWebp(file);
  const contentType = upload.type || "application/octet-stream";
  const target = await api<{ uploadUrl: string; key: string; url: string }>("/api/upload", {
    folder,
    filename: upload.name,
    contentType,
    size: upload.size,
  });
  await put(target.uploadUrl, upload, contentType, (pct) => onProgress?.(Math.round(pct * (isCar ? 0.95 : 1))));
  if (!isCar) return { url: target.url, path: target.key };

  const result = await api<{ url?: string; pathname?: string }>("/api/upload/optimize", { pathname: target.key });
  if (!result.url || !result.pathname?.startsWith("cars/") || !result.pathname.endsWith(".webp")) {
    throw new Error("Server không trả về ảnh xe WebP hợp lệ.");
  }
  onProgress?.(100);
  return { url: result.url, path: result.pathname };
}

export async function deleteImage(url: string): Promise<void> {
  await api("/api/upload/delete", { url });
}
