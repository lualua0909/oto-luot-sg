import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireUploadAdmin, UploadAuthError } from "@/lib/blob/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        await requireUploadAdmin(clientPayload);
        if (!/^(staging\/cars|news|brands)\/[a-zA-Z0-9._-]+$/.test(pathname)) {
          throw new Error("Đường dẫn ảnh không hợp lệ.");
        }
        const isCar = pathname.startsWith("staging/cars/");
        return {
          allowedContentTypes: isCar
            ? ["image/jpeg", "image/png", "image/webp", "image/avif"]
            : ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
          addRandomSuffix: true,
          maximumSizeInBytes: (isCar ? 20 : 10) * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // The admin client waits for /api/upload/optimize before saving car URLs.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof UploadAuthError ? 403 : 400 }
    );
  }
}
