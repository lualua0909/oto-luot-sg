import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { AuthError, bearer, requireAdmin } from "@/lib/server/auth";
import { presignUpload, publicUrl } from "@/lib/server/r2";
import { writeErrorLog } from "@/lib/server/error-log";

export const runtime = "nodejs";

const TYPES = {
  cars: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  news: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  brands: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
} as const;

/** Admin only: a presigned URL to PUT one image straight into R2. */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin(bearer(request));
    const { folder, filename, contentType, size } = (await request.json()) as Record<string, unknown>;
    if (folder !== "cars" && folder !== "news" && folder !== "brands") throw new Error("Thư mục ảnh không hợp lệ.");
    if (typeof contentType !== "string" || !(TYPES[folder] as readonly string[]).includes(contentType)) throw new Error("Định dạng ảnh không được hỗ trợ.");
    if (typeof size !== "number" || size <= 0 || size > (folder === "cars" ? 20 : 10) * 1024 * 1024) throw new Error("Ảnh quá lớn.");
    const base = String(filename ?? "image").replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60) || "image";
    const ext = contentType.split("/")[1].replace("jpeg", "jpg");
    const name = `${Date.now()}-${base}-${randomUUID().slice(0, 8)}.${ext}`;
    const key = folder === "cars" ? `staging/cars/${name}` : `${folder}/${name}`;
    return NextResponse.json({ uploadUrl: await presignUpload(key, contentType), key, url: publicUrl(key) });
  } catch (error) {
    await writeErrorLog("api.upload.presign", error);
    return NextResponse.json({ error: (error as Error).message }, { status: error instanceof AuthError ? 403 : 400 });
  }
}
