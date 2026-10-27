import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireUploadAdmin, UploadAuthError } from "@/lib/blob/admin-auth";
import { writeErrorLog } from "@/lib/server/error-log";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authorization = request.headers.get("authorization");
    const idToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    await requireUploadAdmin(idToken);

    const { url } = (await request.json()) as { url?: unknown };
    if (typeof url !== "string") {
      return NextResponse.json({ error: "URL ảnh không hợp lệ." }, { status: 400 });
    }
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname.endsWith(".public.blob.vercel-storage.com") ||
      !/^\/(cars|news|brands|staging\/cars)\/[a-zA-Z0-9._-]+$/.test(parsed.pathname)
    ) {
      return NextResponse.json({ error: "URL ảnh không hợp lệ." }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await writeErrorLog("api.upload.delete", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof UploadAuthError ? 403 : 400 }
    );
  }
}
