import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireUploadAdmin, UploadAuthError } from "@/lib/blob/admin-auth";
import { writeErrorLog } from "@/lib/server/error-log";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
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
    });
    return NextResponse.json(json);
  } catch (error) {
    await writeErrorLog("api.upload.token", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof UploadAuthError ? 403 : 400 }
    );
  }
}
