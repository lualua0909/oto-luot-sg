import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const API = "https://api.vercel.com/v1/query/web-analytics/visits/aggregate";
// Only real customer traffic: production, without CMS pages.
const FILTER = "environment eq 'production' and not startswith(requestPath, '/admin')";

type Row = Record<string, string | number> & { pageviews: number; visitors: number };

async function aggregate(by: string, since: string, until: string, limit?: number): Promise<Row[]> {
  const params = new URLSearchParams({ projectId: process.env.VERCEL_PROJECT_ID!, by, since, until, filter: FILTER });
  if (limit) params.set("limit", String(limit));
  if (process.env.VERCEL_TEAM_ID) params.set("teamId", process.env.VERCEL_TEAM_ID);

  const res = await fetch(`${API}?${params}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`Vercel Analytics API ${res.status}: ${await res.text()}`);
  return (await res.json()).data;
}

/** Sort by page views desc, keeping the API's "Others" bucket last. */
function rank(rows: Row[], key: string) {
  return rows
    .map((r) => ({ label: String(r[key]), pageviews: r.pageviews, visitors: r.visitors }))
    .sort((a, b) => (a.label === "Others" ? 1 : b.label === "Others" ? -1 : b.pageviews - a.pageviews));
}

/** Page views / visitors for the last N days (production, excluding /admin), via Vercel Web Analytics API. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!process.env.VERCEL_ACCESS_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    return NextResponse.json({ error: "Chưa cấu hình VERCEL_ACCESS_TOKEN / VERCEL_PROJECT_ID" }, { status: 500 });
  }

  const days = Number(req.nextUrl.searchParams.get("days")) === 30 ? 30 : 7;
  const until = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);

  try {
    // Grouping by environment (filtered to production) yields one row = de-duplicated totals.
    const [total, daily, pages, referrers, devices] = await Promise.all([
      aggregate("environment", since, until),
      aggregate("day", since, until),
      aggregate("requestPath", since, until, 10),
      aggregate("referrerHostname", since, until, 6),
      aggregate("deviceType", since, until, 5),
    ]);

    return NextResponse.json({
      total: { pageviews: total[0]?.pageviews ?? 0, visitors: total[0]?.visitors ?? 0 },
      daily: daily.map((r) => ({ date: r.timestamp, pageviews: r.pageviews, visitors: r.visitors })),
      pages: rank(pages, "requestPath"),
      referrers: rank(referrers, "referrerHostname"),
      devices: rank(devices, "deviceType"),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
