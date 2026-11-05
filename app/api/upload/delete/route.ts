import { NextResponse } from "next/server";
import { AuthError, bearer, requireAdmin } from "@/lib/server/auth";
import { deleteObject, keyOf } from "@/lib/server/r2";
import { writeErrorLog } from "@/lib/server/error-log";

export const runtime = "nodejs";

/** Admin only: delete one image from R2 by its public URL. */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin(bearer(request));
    const { url } = (await request.json()) as { url?: unknown };
    const key = typeof url === "string" ? keyOf(url) : null;
    if (!key || !/^(cars|news|brands|staging\/cars)\/[a-zA-Z0-9._-]+$/.test(key)) {
      return NextResponse.json({ error: "URL ảnh không hợp lệ." }, { status: 400 });
    }
    await deleteObject(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await writeErrorLog("api.upload.delete", error);
    return NextResponse.json({ error: (error as Error).message }, { status: error instanceof AuthError ? 403 : 400 });
  }
}
