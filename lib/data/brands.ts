import "server-only";
import { d1, parseRows } from "@/lib/server/d1";
import { BRANDS } from "@/lib/constants";
import type { Brand } from "@/lib/types";

/** Brand logos/names saved by admins (table `brands`), merged over the built-in list. */
export async function getBrands(): Promise<Brand[]> {
  let saved: Brand[] = [];
  try {
    saved = parseRows<Brand>(await d1("SELECT data FROM brands ORDER BY sort"));
  } catch {
    // D1 unreachable: keep the built-in brand list.
  }
  const bySlug = new Map(saved.map((b) => [b.slug, b]));
  return BRANDS.map((b) => ({ ...b, ...bySlug.get(b.slug) })).sort((a, b) => a.order - b.order);
}

export async function saveBrand(brand: Brand): Promise<void> {
  const [row] = await d1<{ data: string }>("SELECT data FROM brands WHERE slug = ?", [brand.slug]);
  const merged = { ...(row ? JSON.parse(row.data) : {}), ...brand };
  await d1(
    "INSERT INTO brands (slug, sort, data) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET sort=excluded.sort, data=excluded.data",
    [brand.slug, Number(merged.order ?? 0), JSON.stringify(merged)],
  );
}
