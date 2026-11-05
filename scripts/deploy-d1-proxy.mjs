// Deploys cloudflare/d1-proxy/worker.js as the Worker "otoluotsaigon-d1" (D1 binding DB,
// secret TOKEN = D1_PROXY_TOKEN) and enables its workers.dev URL.
// Needs CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_D1_DATABASE_ID, D1_PROXY_TOKEN.
//   node scripts/deploy-d1-proxy.mjs
import { existsSync, readFileSync } from "node:fs";

for (const name of [".env.local", ".env"]) if (existsSync(name)) process.loadEnvFile(name);
const NAME = "otoluotsaigon-d1";
const need = (k) => {
  if (!process.env[k]) throw new Error(`Missing ${k}`);
  return process.env[k];
};

async function cf(path, init) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${need("CLOUDFLARE_ACCOUNT_ID")}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${need("CLOUDFLARE_API_TOKEN")}`, ...(init.headers ?? {}) },
  });
  const json = await res.json();
  if (!json.success) throw new Error(`${path}: ${json.errors?.map((e) => e.message).join("; ")}`);
  return json.result;
}

const metadata = {
  main_module: "worker.js",
  compatibility_date: "2025-01-01",
  placement: { mode: "smart" },
  bindings: [
    { type: "d1", name: "DB", id: need("CLOUDFLARE_D1_DATABASE_ID") },
    { type: "secret_text", name: "TOKEN", text: need("D1_PROXY_TOKEN") },
  ],
};
const form = new FormData();
form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
form.append("worker.js", new Blob([readFileSync("cloudflare/d1-proxy/worker.js", "utf8")], { type: "application/javascript+module" }), "worker.js");
await cf(`/workers/scripts/${NAME}`, { method: "PUT", body: form });
await cf(`/workers/scripts/${NAME}/subdomain`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ enabled: true, previews_enabled: false }),
});
console.log(`Deployed ${NAME}.`);
