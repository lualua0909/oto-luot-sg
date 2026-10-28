import { BLOB_HOST_SUFFIX } from "@/lib/blob/image-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Blob file names always carry a timestamp, so one URL never changes content.
// "private" lets only the viewer's browser keep it; CDN/proxies must not.
const BROWSER_ONLY_CACHE = "private, max-age=31536000, immutable";
const NO_SHARED_CACHE = "no-store";

const ALLOWED_PREFIXES = new Set(["cars", "news", "brands", "staging"]);

function sharedHeaders(): Headers {
  const headers = new Headers();
  headers.set("Cache-Control", BROWSER_ONLY_CACHE);
  headers.set("CDN-Cache-Control", NO_SHARED_CACHE);
  headers.set("Vercel-CDN-Cache-Control", NO_SHARED_CACHE);
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

export async function GET(
  request: Request,
  { params }: { params: { store: string; path: string[] } }
): Promise<Response> {
  const { store, path } = params;
  if (!/^[a-z0-9]+$/i.test(store) || !path?.length || !ALLOWED_PREFIXES.has(path[0])) {
    return new Response("Not found", { status: 404 });
  }
  if (path.some((segment) => !segment || segment === "." || segment === "..")) {
    return new Response("Not found", { status: 404 });
  }

  const blobUrl = `https://${store}${BLOB_HOST_SUFFIX}/${path.map(encodeURIComponent).join("/")}`;
  const upstreamHeaders: HeadersInit = {};
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch) upstreamHeaders["If-None-Match"] = ifNoneMatch;

  // no-store: the server never keeps a copy (no Next data cache).
  const upstream = await fetch(blobUrl, { cache: "no-store", headers: upstreamHeaders });

  const headers = sharedHeaders();
  const etag = upstream.headers.get("etag");
  if (etag) headers.set("ETag", etag);

  if (upstream.status === 304) {
    return new Response(null, { status: 304, headers });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    // Missing images must not stick in the browser either.
    return new Response("Not found", {
      status: upstream.status === 404 || upstream.ok ? 404 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  headers.set("Content-Type", contentType);
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { status: 200, headers });
}
