/**
 * Every image loads straight from the public R2 domain (NEXT_PUBLIC_R2_PUBLIC_URL).
 * Never serve or stream image bytes through a Next.js route or function: Vercel bills
 * Function Duration for every image view. Client-safe.
 */
export const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").trim().replace(/\/+$/, "");

/** Image URL for <img>/<Image>: stored URLs are already public R2 URLs (or /images/..., Google avatars). */
export function imageSrc(url: string): string;
export function imageSrc(url: string | null | undefined): string | undefined;
export function imageSrc(url: string | null | undefined): string | undefined {
  return url || undefined;
}
