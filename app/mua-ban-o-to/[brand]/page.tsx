import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarsByBrand } from "@/lib/firebase/cars";
import { BrandListingContent } from "@/components/car/brand-listing-content";
import { BRANDS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

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
    description: `Danh sách xe ${brand.name} cũ, xe lướt đang có tại showroom TP.HCM. Xem giá, năm sản xuất, số km và thông tin từng xe.`,
    alternates: { canonical: url },
    openGraph: { url },
    robots: cars.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function BrandListingPage({ params }: { params: { brand: string } }) {
  const brand = BRANDS.find((b) => b.slug === params.brand);
  if (!brand) notFound();

  const cars = await getCarsByBrand(params.brand).catch(() => []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Xe ${brand.name} cũ tại TP.HCM`,
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: car.title,
      url: absoluteUrl(`/xe/${car.slug}`),
    })),
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><BrandListingContent brandSlug={brand.slug} cars={cars} /></>;
}
