import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarsByBrand } from "@/lib/firebase/cars";
import { BrandListingContent } from "@/components/car/brand-listing-content";
import { BRANDS } from "@/lib/constants";

export const revalidate = 60;

export function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { brand: string };
}): Promise<Metadata> {
  const brand = BRANDS.find((b) => b.slug === params.brand);
  if (!brand) return {};
  return {
    title: `Mua bán ô tô cũ ${brand.name}`,
    description: `Danh sách xe ${brand.name} lướt đang bán tại Ô TÔ LƯỚT SÀI GÒN — kiểm tra kỹ, giấy tờ minh bạch, giá tốt.`,
  };
}

export default async function BrandListingPage({ params }: { params: { brand: string } }) {
  const brand = BRANDS.find((b) => b.slug === params.brand);
  if (!brand) notFound();

  const cars = await getCarsByBrand(params.brand).catch(() => []);

  return <BrandListingContent brandSlug={brand.slug} cars={cars} />;
}
