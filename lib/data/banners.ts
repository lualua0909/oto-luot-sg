import "server-only";
import { d1 } from "@/lib/server/d1";
import { R2_PUBLIC_URL } from "@/lib/images/url";
import { BANNERS_SETTINGS_ID, DEFAULT_BANNERS, MAX_BANNERS, parseBanners, type BannerSlide } from "@/lib/banners";

export async function getBanners(): Promise<BannerSlide[]> {
  try {
    const [row] = await d1<{ data: string }>("SELECT data FROM settings WHERE id = ?", [BANNERS_SETTINGS_ID]);
    return parseBanners(row ? JSON.parse(row.data) : undefined);
  } catch {
    return DEFAULT_BANNERS;
  }
}

export async function saveBanners(slides: BannerSlide[]): Promise<void> {
  if (!Array.isArray(slides) || slides.length === 0) throw new Error("Cần ít nhất 1 ảnh banner.");
  if (slides.length > MAX_BANNERS) throw new Error(`Tối đa ${MAX_BANNERS} ảnh banner.`);
  const clean = slides.map((s) => {
    const url = String(s?.url ?? "");
    // Banners must load straight from the public R2 domain.
    if (!R2_PUBLIC_URL || !url.startsWith(`${R2_PUBLIC_URL}/`)) throw new Error("Ảnh banner phải nằm trên R2.");
    return { url, alt: String(s?.alt ?? "").slice(0, 200) };
  });
  await d1(
    "INSERT INTO settings (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
    [BANNERS_SETTINGS_ID, JSON.stringify({ slides: clean })],
  );
}
