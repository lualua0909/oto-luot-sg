# Agent notes — Ô tô Lướt Sài Gòn

## Data — Cloudflare D1 (no Firestore)
All data lives in D1 (schema `d1/schema.sql`). Server code reads/writes only through `lib/data/*` (server-only), via the Worker `cloudflare/d1-proxy` (`D1_PROXY_URL`, `D1_PROXY_TOKEN`; deploy `node scripts/deploy-d1-proxy.mjs`). Client components never touch D1: they call server actions in `lib/actions.ts` through `lib/store/*`; every admin action verifies the Firebase ID token and the D1 role (`users.role` 0/1). Firebase is only used for sign-in. No data cache.

## Images — straight from R2, never streamed (strict rule)
Every image is in R2 bucket `otoluotsaigon` and loads straight from `NEXT_PUBLIC_R2_PUBLIC_URL`. Never add a route, API handler, proxy, rewrite or server code that reads image bytes and returns them to the browser (Vercel bills Function Duration for every image view; the old `/api/img` route was removed for this). Uploads: the browser PUTs to a presigned URL from `/api/upload`; car photos are then compressed by `/api/upload/optimize` (reads R2 to process, never to serve). Every object has `Cache-Control: public, max-age=31536000, immutable`. No Vercel Blob.
