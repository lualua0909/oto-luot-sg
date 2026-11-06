import "server-only";
import { d1Batch } from "@/lib/server/d1";

interface CarUrl { slug: string; brand: string; status: string; updated_at: number }
interface NewsUrl { slug: string; updated_at: number }

/** Read only public URL fields, without the listing limits or admin-only data. */
export async function getSitemapRecords() {
  const [cars, news] = await d1Batch([
    { sql: "SELECT slug, brand, status, updated_at FROM cars WHERE status != 'an' ORDER BY slug" },
    { sql: "SELECT slug, updated_at FROM news WHERE is_published = 1 ORDER BY slug" },
  ]);
  return { cars: cars.rows as unknown as CarUrl[], news: news.rows as unknown as NewsUrl[] };
}
