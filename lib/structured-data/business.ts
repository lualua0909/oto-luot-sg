import { cache } from "react";
import { getShowroomSettings } from "@/lib/firebase/settings";
import { getContentTexts } from "@/lib/firebase/content";
import { SITE } from "@/lib/constants";
import type { ShowroomSettings } from "@/lib/types";
import { BUSINESS_CONFIG } from "./config";

export type OpeningHours = (typeof BUSINESS_CONFIG.BUSINESS_OPENING_HOURS.specification)[number];

/** Verified business facts for the schema, merged from Firestore settings + config. */
export interface BusinessProfile {
  name: string;
  description: string;
  phones: string[]; // E.164, first is the main line
  email: string;
  address: string;
  sameAs: string[];
  mapUrl: string;
  taxId: string;
  openingHours: OpeningHours[] | null;
}

// One Firestore read per request, shared by every caller in the same render.
export const getCachedShowroomSettings = cache(async (): Promise<ShowroomSettings | null> =>
  getShowroomSettings().catch(() => null)
);
export const getCachedContentTexts = cache(async () => getContentTexts().catch(() => ({} as Record<string, string>)));

const normalize = (value: string) => value.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();

/** "0922 54 9999 - 096 9550995" → ["+84922549999", "+84969550995"] */
export function toE164Phones(...sources: string[]): string[] {
  const phones = sources
    .flatMap((source) => source.split(/[-–\/,;|]/))
    .map((part) => part.replace(/\D/g, ""))
    .filter((digits) => /^0\d{9,10}$/.test(digits) || /^84\d{9,10}$/.test(digits))
    .map((digits) => `+84${digits.replace(/^(84|0)/, "")}`);
  return Array.from(new Set(phones));
}

/**
 * Official profile URLs only: tracking params removed, duplicates dropped.
 * Zalo chat/QR links are contact channels, not profiles, so they are skipped.
 */
export function cleanSameAs(urls: string[]): string[] {
  const out = new Set<string>();
  for (const raw of urls) {
    if (!raw) continue;
    let url: URL;
    try {
      url = new URL(raw.trim());
    } catch {
      continue;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") continue;
    if (/(^|\.)zalo(app)?\.(me|com)$/.test(url.hostname)) continue;
    // Keep only the id param Facebook needs for profile.php links.
    const keep = url.hostname.endsWith("facebook.com") && url.pathname === "/profile.php" ? url.searchParams.get("id") : null;
    url.search = keep ? `?id=${keep}` : "";
    url.hash = "";
    out.add(url.toString());
  }
  return Array.from(out);
}

function resolveOpeningHours(texts: Record<string, string>): OpeningHours[] | null {
  const { contentTextId, displayText, specification } = BUSINESS_CONFIG.BUSINESS_OPENING_HOURS;
  const shown = texts[contentTextId];
  // The visible text was edited in the CMS → we can no longer vouch for the spec.
  if (shown && normalize(shown) !== normalize(displayText)) return null;
  return [...specification];
}

export const getBusinessProfile = cache(async (): Promise<BusinessProfile> => {
  const [settings, texts] = await Promise.all([getCachedShowroomSettings(), getCachedContentTexts()]);
  const site = settings ?? SITE;
  return {
    name: site.fullName || site.name,
    description: site.description,
    phones: toE164Phones(site.phone, site.phoneDisplay),
    email: site.email,
    address: site.address,
    sameAs: cleanSameAs([site.facebook, site.tiktok1, site.tiktok2, site.googleBusinessUrl, site.zalo]),
    mapUrl: site.googleBusinessUrl,
    taxId: site.taxCode,
    openingHours: resolveOpeningHours(texts),
  };
});
