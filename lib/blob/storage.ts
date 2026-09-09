import { upload } from "@vercel/blob/client";
import { CarImage } from "../types";
import { toWebp } from "./webp";

/**
 * Upload one image file to Vercel Blob under `folder/`.
 * The file is converted to WebP first (see `toWebp`).
 * Returns the public URL + blob pathname (kept for the delete flow).
 * Pass `onProgress` (0-100) to drive a progress bar in the admin UI.
 */
export async function uploadImage(
  file: File,
  folder: "cars" | "news" | "brands",
  onProgress?: (pct: number) => void
): Promise<CarImage> {
  const webpFile = await toWebp(file);
  const safeName = webpFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const blob = await upload(`${folder}/${Date.now()}-${safeName}`, webpFile, {
    access: "public",
    handleUploadUrl: "/api/upload",
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  });
  return { url: blob.url, path: blob.pathname };
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Non-fatal — image may already be gone. Don't block the calling flow.
  }
}
