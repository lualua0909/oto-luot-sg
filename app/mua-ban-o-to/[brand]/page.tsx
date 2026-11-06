import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarsByBrand } from "@/lib/data/cars";
import { BrandListingContent } from "@/components/car/brand-listing-content";
import { BRANDS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";
import { socialMetadata } from "@/lib/social-metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { getBusinessProfile } from "@/lib/structured-data/business";
import { breadcrumbNode, businessRefNode, itemListNode, webPageNode, websiteNode, ids } from "@/lib/structured-data/schema";

const brandDescription = (name: string) =>
  `Danh sách xe ${name} cũ, xe lướt đang có tại showroom TP.HCM. Xem giá, năm sản xuất, số km và thông tin từng xe.`;

export async function generateMetadata({
  params,
}: {
  params: { brand: string };
}): Promise<Metadata> {
  const brand = BRANDS.find((b) => b.slug === params.brand);
  if (!brand) return {};
  const cars = await getCarsByBrand(params.brand).catch(() => []);
  const url = absoluteUrl(`/mua-ban-o-to/${brand.slug}`);
  return {
    title: `Xe ${brand.name} cũ tại TPHCM - Xe đang bán`,
    description: brandDescription(brand.name),
    alternates: { canonical: url },
    ...socialMetadata(`Xe ${brand.name} cũ tại TPHCM - Xe đang bán`, brandDescription(brand.name), `/mua-ban-o-to/${brand.slug}`),
    robots: cars.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function BrandListingPage({ params }: { params: { brand: string } }) {
  const brand = BRANDS.find((b) => b.slug === params.brand);
  if (!brand) notFound();

  const [cars, business] = await Promise.all([getCarsByBrand(params.brand).catch(() => []), getBusinessProfile()]);
  const path = `/mua-ban-o-to/${brand.slug}`;
  const name = `Xe ${brand.name} cũ tại TP.HCM`;
  // Brand pages without inventory are noindex (see generateMetadata) → no schema.
  const graph = cars.length > 0
    ? [
        websiteNode(business),
        businessRefNode(business),
        webPageNode({ path, type: "CollectionPage" as const, name, description: brandDescription(brand.name), mainEntity: ids.itemList(path), hasBreadcrumb: true }),
        itemListNode(path, name, cars.map((car) => ({ name: car.title, path: `/xe/${car.slug}` }))),
        breadcrumbNode(path, [
          { name: "Trang chủ", path: "/" },
          { name: "Mua bán ô tô", path: "/mua-ban-o-to" },
          { name: brand.name, path },
        ]),
      ]
    : [];

  return <><JsonLd graph={graph} /><BrandListingContent brandSlug={brand.slug} cars={cars} /></>;
}
