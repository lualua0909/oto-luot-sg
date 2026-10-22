import { SITE } from "./constants";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || SITE.url).replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized === "/" ? "" : normalized}`;
}

/** Removes decorative social-post characters from titles and snippets. */
export function cleanSeoText(value: string) {
  return value
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[🔥✨✅👉💥📍📞🏠🏪]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s|–—-]+|[\s|–—-]+$/g, "")
    .trim();
}

export function compactDescription(value: string, maxLength = 155) {
  const clean = cleanSeoText(value).replace(/\s+/g, " ");
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}
