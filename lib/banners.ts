import { R2_PUBLIC_URL } from "@/lib/images/url";

/** Homepage hero slides: row 'banners' in table `settings`, `data.slides`. Client-safe. */
export interface BannerSlide {
  url: string;
  alt: string;
}

export const BANNERS_SETTINGS_ID = "banners";
export const MAX_BANNERS = 10;

const DEFAULT_ALTS = ["Showroom Ô TÔ LƯỚT SÀI GÒN", "Xe ô tô lướt đang bán", "Nhân viên tư vấn kiểm tra xe"];

/** Synced to R2 by scripts/sync-banners-to-r2.mjs. */
export const DEFAULT_BANNERS: BannerSlide[] = DEFAULT_ALTS.map((alt, i) => ({
  url: R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/banners/hero-car-${i + 1}.webp` : `/images/hero-car-${i + 1}.jpg`,
  alt,
}));

export function parseBanners(data?: { slides?: unknown }): BannerSlide[] {
  const slides = Array.isArray(data?.slides)
    ? data.slides
        .filter((s): s is BannerSlide => typeof s?.url === "string" && s.url !== "")
        .map((s) => ({ url: s.url, alt: typeof s.alt === "string" ? s.alt : "" }))
    : [];
  return slides.length ? slides.slice(0, MAX_BANNERS) : DEFAULT_BANNERS;
}
