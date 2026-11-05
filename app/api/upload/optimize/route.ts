import { NextResponse } from "next/server";
import { AuthError, bearer, requireAdmin } from "@/lib/server/auth";
import { CAR_IMAGE_MAX_BYTES, CAR_IMAGE_MAX_DIMENSION, compressCarImage } from "@/lib/server/image-compress";
import { deleteObject, headObject, publicUrl, putObject, readObject } from "@/lib/server/r2";
import { writeErrorLog } from "@/lib/server/error-log";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Admin only: compress an uploaded car photo (R2 staging/cars/...) into cars/<name>.webp. */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin(bearer(request));
    const { pathname } = (await request.json()) as { pathname?: unknown };
    if (typeof pathname !== "string" || !/^staging\/cars\/[a-zA-Z0-9._-]+$/.test(pathname)) {
      return NextResponse.json({ error: "Đường dẫn ảnh xe không hợp lệ." }, { status: 400 });
    }
    const original = await headObject(pathname);
    if (!original || (original.ContentLength ?? 0) > 20 * 1024 * 1024) throw new Error("Không tìm thấy ảnh xe vừa tải lên.");

    const compressed = await compressCarImage(await readObject(pathname));
    if (compressed.data.length > CAR_IMAGE_MAX_BYTES || Math.max(compressed.width, compressed.height) > CAR_IMAGE_MAX_DIMENSION) {
      throw new Error("Ảnh xe sau nén không đạt chuẩn.");
    }
    const finalKey = `cars/${pathname.slice("staging/cars/".length).replace(/\.[^.]+$/, "")}.webp`;
    await putObject(finalKey, compressed.data, "image/webp");
    await deleteObject(pathname).catch((e) => writeErrorLog("api.upload.optimize.cleanup-staging", e));

    return NextResponse.json({
      url: publicUrl(finalKey),
      pathname: finalKey,
      size: compressed.data.length,
      width: compressed.width,
      height: compressed.height,
    });
  } catch (error) {
    await writeErrorLog("api.upload.optimize", error);
    return NextResponse.json({ error: (error as Error).message || "Không thể nén ảnh xe." }, { status: error instanceof AuthError ? 403 : 400 });
  }
}
