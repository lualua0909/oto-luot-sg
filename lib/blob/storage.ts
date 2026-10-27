import { put } from "@vercel/blob/client";
import { getAuth } from "firebase/auth";
import { CarImage } from "../types";
import { firebaseApp } from "../firebase/client";
import { toWebp } from "./webp";

/**
 * Upload one image file to Vercel Blob under `folder/`.
 * Car photos are compressed and checked on the server before returning a URL.
 * Other folders continue to use browser-side WebP conversion.
 * Returns the public URL + blob pathname (kept for the delete flow).
 * Pass `onProgress` (0-100) to drive a progress bar in the admin UI.
 */
export async function uploadImage(
  file: File,
  folder: "cars" | "news" | "brands",
  onProgress?: (pct: number) => void
): Promise<CarImage> {
  const idToken = await getAuth(firebaseApp).currentUser?.getIdToken();
  if (!idToken) throw new Error("Vui lòng đăng nhập tài khoản quản trị.");

  const uploadFile = folder === "cars" ? file : await toWebp(file);
  const safeName = uploadFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const uploadPath = folder === "cars"
    ? `staging/cars/${Date.now()}-${safeName}`
    : `${folder}/${Date.now()}-${safeName}`;
  // Fetch the client token ourselves: the SDK's upload() hides the server's
  // error message behind "Failed to retrieve the client token".
  const tokenResponse = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "blob.generate-client-token",
      payload: { pathname: uploadPath, clientPayload: idToken, multipart: false },
    }),
  });
  const tokenResult = (await tokenResponse.json().catch(() => null)) as
    | { clientToken?: string; error?: string }
    | null;
  if (!tokenResponse.ok || !tokenResult?.clientToken) {
    throw new Error(tokenResult?.error ?? `Không lấy được quyền tải ảnh (HTTP ${tokenResponse.status}).`);
  }

  const blob = await put(uploadPath, uploadFile, {
    access: "public",
    token: tokenResult.clientToken,
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage * (folder === "cars" ? 0.95 : 1))),
  });

  if (folder === "cars") {
    const response = await fetch("/api/upload/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ pathname: blob.pathname }),
    });
    const result = (await response.json()) as { error?: string; url?: string; pathname?: string };
    if (!response.ok) throw new Error(result.error ?? "Không thể nén ảnh xe trên server.");
    if (!result.url || !result.pathname?.startsWith("cars/") || !result.pathname.endsWith(".webp")) {
      throw new Error("Server không trả về ảnh xe WebP hợp lệ.");
    }
    onProgress?.(100);
    return { url: result.url, path: result.pathname };
  }
  return { url: blob.url, path: blob.pathname };
}

export async function deleteImage(url: string): Promise<void> {
  const idToken = await getAuth(firebaseApp).currentUser?.getIdToken();
  if (!idToken) throw new Error("Vui lòng đăng nhập tài khoản quản trị.");

  const response = await fetch("/api/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(result?.error ?? "Không thể xóa ảnh.");
  }
}
