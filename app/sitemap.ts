import type { MetadataRoute } from "next";
import { BRANDS } from "@/lib/constants";
import { getPublishedCars } from "@/lib/firebase/cars";
import { getPublishedNews } from "@/lib/firebase/news";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/mua-ban-o-to`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/dich-vu`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/tin-tuc`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/dich-vu/kiem-tra-xe-o-to-cu`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/dich-vu/thu-mua-xe-o-to-cu`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/dich-vu/tra-gop`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/chinh-sach/mua-hang-thanh-toan`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/chinh-sach/bao-hanh`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/chinh-sach/ban-hang`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/chinh-sach/bao-mat-thong-tin`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [cars, news] = await Promise.all([
    getPublishedCars(500).catch(() => []),
    getPublishedNews(200).catch(() => []),
  ]);

  const brandsWithInventory = new Set(cars.map((car) => car.brand));
  const brandPages: MetadataRoute.Sitemap = BRANDS
    .filter((brand) => brandsWithInventory.has(brand.slug))
    .map((brand) => ({
      url: `${base}/mua-ban-o-to/${brand.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

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
