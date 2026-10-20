import { del, head, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireUploadAdmin, UploadAuthError } from "@/lib/blob/admin-auth";
import { CAR_IMAGE_MAX_BYTES, CAR_IMAGE_MAX_DIMENSION, compressCarImage } from "@/lib/blob/server-webp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authorization = request.headers.get("authorization");
    const idToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    await requireUploadAdmin(idToken);

    const body = (await request.json()) as { pathname?: unknown };
    const pathname = body.pathname;
    if (typeof pathname !== "string" || !/^staging\/cars\/[a-zA-Z0-9._-]+$/.test(pathname)) {
      return NextResponse.json({ error: "Đường dẫn ảnh xe không hợp lệ." }, { status: 400 });
    }

    const original = await head(pathname);
    if (original.pathname !== pathname || !original.url || !original.etag || original.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Không thể xác nhận ảnh xe trên Blob." }, { status: 400 });
    }

    const response = await fetch(original.url, { cache: "no-store" });
    if (!response.ok) throw new Error("Không thể tải ảnh xe từ Blob để nén.");
    const input = Buffer.from(await response.arrayBuffer());
    if (input.length !== original.size) throw new Error("Dung lượng ảnh xe trên Blob không khớp.");

    const compressed = await compressCarImage(input);
    if (
      compressed.data.length > CAR_IMAGE_MAX_BYTES ||
      Math.max(compressed.width, compressed.height) > CAR_IMAGE_MAX_DIMENSION
    ) {
      throw new Error("Ảnh xe sau nén không đạt chuẩn.");
    }

    const filename = pathname.slice("staging/cars/".length).replace(/\.[^.]+$/, "");
    const finalPathname = `cars/${filename}.webp`;
    const uploaded = await put(finalPathname, compressed.data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    });
    const finalMetadata = await head(uploaded.url);
    if (
      uploaded.pathname !== finalPathname ||
      finalMetadata.size !== compressed.data.length ||
      finalMetadata.contentType !== "image/webp"
    ) {
      throw new Error("Ảnh xe đã lưu trên Blob không đạt chuẩn.");
    }

    try {
      await del(original.url);
    } catch (cleanupError) {
      console.warn("Could not delete staged car image", cleanupError);
    }

    return NextResponse.json({
      url: uploaded.url,
      pathname: finalPathname,
      size: compressed.data.length,
      width: compressed.width,
      height: compressed.height,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể nén ảnh xe.";
    return NextResponse.json(
      { error: message },
      { status: error instanceof UploadAuthError ? 403 : 400 }
    );
  }
}
