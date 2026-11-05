// Cloudflare Worker in front of the otoluotsaigon D1 database (binding: DB).
// The website (Vercel) sends SQL here instead of the Cloudflare REST API: lower latency,
// no REST API rate limit, and several statements run atomically with DB.batch().
// Auth: "Authorization: Bearer <TOKEN>" (secret binding, same value as D1_PROXY_TOKEN).
// Deploy: node scripts/deploy-d1-proxy.mjs

const enc = new TextEncoder();

function sameSecret(a, b) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/query") return new Response("Not found", { status: 404 });
    const auth = request.headers.get("authorization") ?? "";
    if (!env.TOKEN || !sameSecret(auth, `Bearer ${env.TOKEN}`)) return new Response("Unauthorized", { status: 401 });

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }
    const statements = Array.isArray(body?.statements) ? body.statements : [];
    if (!statements.length) return Response.json({ ok: false, error: "No statements" }, { status: 400 });

    try {
      const prepared = statements.map((s) => env.DB.prepare(String(s.sql)).bind(...(Array.isArray(s.params) ? s.params : [])));
      const results = prepared.length === 1 ? [await prepared[0].all()] : await env.DB.batch(prepared);
      return Response.json({
        ok: true,
        results: results.map((r) => ({ rows: r.results ?? [], changes: r.meta?.changes ?? 0 })),
      });
    } catch (error) {
      return Response.json({ ok: false, error: String(error?.message ?? error) }, { status: 400 });
    }
  },
};

export default worker;
