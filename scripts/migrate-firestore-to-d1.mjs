// One-time copy of every Firestore collection (cars, news, leads, brands, settings,
// content, users) into Cloudflare D1 (schema: d1/schema.sql). Vercel Blob image URLs
// in the data are rewritten to the public R2 URL. Tables are emptied first, so it can
// be re-run right before switching over.
//   node scripts/migrate-firestore-to-d1.mjs [--dry-run]
import { existsSync, readFileSync } from "node:fs";

for (const name of [".env.local", ".env"]) if (existsSync(name)) process.loadEnvFile(name);
const dryRun = process.argv.includes("--dry-run");
const need = (k) => {
  if (!process.env[k]) throw new Error(`Missing ${k}`);
  return process.env[k];
};
const PROJECT = need("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
const R2 = need("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/+$/, "");

async function d1(statements) {
  const res = await fetch(`${need("D1_PROXY_URL")}/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${need("D1_PROXY_TOKEN")}`, "content-type": "application/json" },
    body: JSON.stringify({ statements }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.results;
}

// ---- Firestore REST -> plain JSON ----
function value(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return Date.parse(v.timestampValue);
  if ("mapValue" in v) return fields(v.mapValue.fields ?? {});
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(value);
  if ("referenceValue" in v) return v.referenceValue;
  if ("geoPointValue" in v) return v.geoPointValue;
  return null;
}
const fields = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, value(v)]));

async function readCollection(name) {
  const docs = [];
  let pageToken = "";
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${name}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    const json = JSON.parse(await res.text());
    if (json.error) throw new Error(`${name}: ${json.error.status} ${json.error.message}`);
    for (const d of json.documents ?? []) docs.push({ id: d.name.split("/").pop(), ...fields(d.fields ?? {}) });
    pageToken = json.nextPageToken ?? "";
  } while (pageToken);
  return docs;
}

// Blob URLs (direct or through the old /api/img proxy) -> public R2 URL, same path.
const rewrite = (x) =>
  typeof x === "string"
    ? x.replace(/https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//gi, `${R2}/`).replace(/(^|["'(\s])\/api\/img\/[a-z0-9]+\//gi, `$1${R2}/`)
    : Array.isArray(x)
      ? x.map(rewrite)
      : x && typeof x === "object"
        ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, rewrite(v)]))
        : x;

const num = (v, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const json = ({ id, ...rest }) => { void id; return JSON.stringify(rest); };

const plan = {
  cars: (d) => ({ sql: "INSERT INTO cars (id, slug, status, brand, is_featured, created_at, updated_at, data) VALUES (?,?,?,?,?,?,?,?)", params: [d.id, d.slug ?? d.id, d.status ?? "an", d.brand ?? "", d.isFeatured ? 1 : 0, num(d.createdAt), num(d.updatedAt, num(d.createdAt)), json(d)] }),
  news: (d) => ({ sql: "INSERT INTO news (id, slug, is_published, created_at, updated_at, data) VALUES (?,?,?,?,?,?)", params: [d.id, d.slug ?? d.id, d.isPublished ? 1 : 0, num(d.createdAt), num(d.updatedAt, num(d.createdAt)), json(d)] }),
  leads: (d) => ({ sql: "INSERT INTO leads (id, status, created_at, data) VALUES (?,?,?,?)", params: [d.id, d.status ?? "moi", num(d.createdAt), json(d)] }),
  brands: (d) => ({ sql: "INSERT INTO brands (slug, sort, data) VALUES (?,?,?)", params: [d.slug ?? d.id, num(d.order), json(d)] }),
  settings: (d) => ({ sql: "INSERT INTO settings (id, data) VALUES (?,?)", params: [d.id, json(d)] }),
  content: (d) => ({ sql: "INSERT INTO content (id, data) VALUES (?,?)", params: [d.id, json(d)] }),
  users: (d) => ({ sql: "INSERT INTO users (uid, email, role, created_at) VALUES (?,?,?,?)", params: [d.id, d.email ?? "", num(d.role, 2), num(d.createdAt, Date.now())] }),
};

const schema = readFileSync("d1/schema.sql", "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((sql) => ({ sql }));
if (!dryRun) await d1(schema);

const report = [];
for (const [name, toSql] of Object.entries(plan)) {
  const docs = (await readCollection(name)).map(rewrite);
  const leftovers = JSON.stringify(docs).match(/blob\.vercel-storage\.com/g)?.length ?? 0;
  if (!dryRun) {
    const statements = [{ sql: `DELETE FROM ${name}` }, ...docs.map(toSql)];
    await d1(statements); // one transaction per collection
  }
  const [{ rows }] = dryRun ? [{ rows: [{ n: -1 }] }] : await d1([{ sql: `SELECT COUNT(*) AS n FROM ${name}` }]);
  report.push({ name, firestore: docs.length, d1: rows[0].n, blobUrlsLeft: leftovers });
}
console.table(report);
if (report.some((r) => !dryRun && (r.firestore !== r.d1 || r.blobUrlsLeft))) process.exitCode = 1;
