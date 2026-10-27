import { NextResponse } from "next/server";
import { requireFirebaseUser, UploadAuthError } from "@/lib/blob/admin-auth";
import { writeErrorLog } from "@/lib/server/error-log";

export const runtime = "nodejs";

const REPORT_LIMIT = 30;
const REPORT_WINDOW_MS = 10 * 60 * 1000;
const recentReports = new Map<string, number[]>();

interface ClientErrorReport {
  context?: unknown;
  name?: unknown;
  message?: unknown;
  code?: unknown;
  stack?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authorization = request.headers.get("authorization");
    const idToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const uid = await requireFirebaseUser(idToken);

    const now = Date.now();
    const userReports = (recentReports.get(uid) ?? []).filter((timestamp) => now - timestamp < REPORT_WINDOW_MS);
    if (userReports.length >= REPORT_LIMIT) {
      return NextResponse.json({ error: "Đã vượt quá giới hạn ghi error log." }, { status: 429 });
    }
    userReports.push(now);
    recentReports.set(uid, userReports);
    if (recentReports.size > 1000) {
      for (const [reportedUid, timestamps] of recentReports) {
        if (!timestamps.some((timestamp) => now - timestamp < REPORT_WINDOW_MS)) recentReports.delete(reportedUid);
      }
    }

    const report = (await request.json()) as ClientErrorReport;
    if (typeof report.context !== "string" || typeof report.message !== "string") {
      return NextResponse.json({ error: "Thông tin lỗi không hợp lệ." }, { status: 400 });
    }

    const error = new Error(report.message.slice(0, 8000));
    if (typeof report.name === "string") error.name = report.name.slice(0, 120);
    if (typeof report.stack === "string") error.stack = report.stack.slice(0, 12000);
    if (typeof report.code === "string") Object.assign(error, { code: report.code.slice(0, 120) });

    const written = await writeErrorLog(`admin.${report.context}`, error);
    return written
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Không thể ghi file log trên máy chủ." }, { status: 500 });
  } catch (error) {
    console.error("Could not accept admin error report", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof UploadAuthError ? 403 : 400 },
    );
  }
}
