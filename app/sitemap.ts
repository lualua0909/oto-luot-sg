import type { MetadataRoute } from "next";
import { SITE, BRANDS } from "@/lib/constants";
import { getPublishedCars } from "@/lib/firebase/cars";
import { getPublishedNews } from "@/lib/firebase/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/mua-ban-o-to`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/dich-vu`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/tin-tuc`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const brandPages: MetadataRoute.Sitemap = BRANDS.map((b) => ({
    url: `${base}/mua-ban-o-to/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const [cars, news] = await Promise.all([
    getPublishedCars(500).catch(() => []),
    getPublishedNews(200).catch(() => []),
  ]);

  const carPages: MetadataRoute.Sitemap = cars.map((c) => ({
    url: `${base}/xe/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${base}/tin-tuc/${n.slug}`,
    lastModified: new Date(n.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...brandPages, ...carPages, ...newsPages];
}
