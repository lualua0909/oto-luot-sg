import { NextResponse } from "next/server";
import { AuthError, bearer, requireAdmin } from "@/lib/server/auth";
import { listObjects, publicUrl } from "@/lib/server/r2";
import { writeErrorLog } from "@/lib/server/error-log";

export const dynamic = "force-dynamic";

/** Admin only: every image in R2 (list only; images load from the public R2 URL). */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin(bearer(request));
    const objects = await listObjects();
    return NextResponse.json({
      files: objects.map((o) => ({ url: publicUrl(o.key), pathname: o.key, size: o.size, uploadedAt: o.uploadedAt })),
    });
  } catch (error) {
    await writeErrorLog("api.images.list", error);
    return NextResponse.json({ error: (error as Error).message }, { status: error instanceof AuthError ? 403 : 400 });
  }
}
