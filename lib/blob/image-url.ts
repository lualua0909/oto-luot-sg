const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * Turn a public Vercel Blob URL into our own /api/img/... URL so the browser
 * caches the image (see app/api/img/[store]/[...path]/route.ts). Any other
 * URL (local /images/..., Google avatars) is returned unchanged.
 */
export function imageSrc(url: string): string;
export function imageSrc(url: string | null | undefined): string | undefined;
export function imageSrc(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) return url;
    const store = parsed.hostname.slice(0, -BLOB_HOST_SUFFIX.length);
    return `/api/img/${store}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function isProxiedImage(src: string): boolean {
  return src.startsWith("/api/img/");
}

export { BLOB_HOST_SUFFIX };
