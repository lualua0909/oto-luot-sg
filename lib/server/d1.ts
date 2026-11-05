import "server-only";

/**
 * Cloudflare D1 (all site data, schema in d1/schema.sql). The site talks to the Worker
 * in cloudflare/d1-proxy (D1_PROXY_URL + D1_PROXY_TOKEN): low latency, no REST API rate
 * limit, and the statements of one call run in a single transaction.
 * No data cache: every call reaches D1.
 */
export type SqlValue = string | number | null;
export type Statement = { sql: string; params?: SqlValue[] };
type Result = { rows: Record<string, unknown>[]; changes: number };

export async function d1Batch(statements: Statement[]): Promise<Result[]> {
  const url = process.env.D1_PROXY_URL?.trim();
  const token = process.env.D1_PROXY_TOKEN?.trim();
  if (!url || !token) throw new Error("Thiếu D1_PROXY_URL / D1_PROXY_TOKEN.");
  const res = await fetch(`${url.replace(/\/+$/, "")}/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ statements }),
    cache: "no-store",
  });
  const text = await res.text();
  let json: { ok?: boolean; error?: string; results?: Result[] };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`D1 HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.ok || !json.ok || !json.results) throw new Error(json.error || `D1 HTTP ${res.status}`);
  return json.results;
}

export async function d1<T = Record<string, unknown>>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  return (await d1Batch([{ sql, params }]))[0].rows as T[];
}

/** Rows store the record as JSON in `data`; `extra` adds key columns such as the id. */
export function parseRows<T>(rows: { data?: unknown }[], extra: (row: Record<string, unknown>) => Partial<T> = () => ({})): T[] {
  return rows.map((row) => ({ ...(JSON.parse(String(row.data ?? "{}")) as T), ...extra(row as Record<string, unknown>) }));
}
