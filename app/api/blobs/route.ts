import { list, type ListBlobResultBlob } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** List every blob in the store (follows pagination cursor). */
export async function GET(): Promise<NextResponse> {
  try {
    const blobs: ListBlobResultBlob[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ cursor, limit: 1000 });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    return NextResponse.json({
      blobs: blobs.map((b) => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
