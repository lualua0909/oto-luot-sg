"use client";

import { useBrands } from "@/components/shared/brands-provider";
import { SectionHeading } from "@/components/shared/section-heading";
import { CarListing } from "@/components/car/car-listing";
import type { Car } from "@/lib/types";

export function BrandListingContent({ brandSlug, cars }: { brandSlug: string; cars: Car[] }) {
  const brands = useBrands();
  const brand = brands.find((item) => item.slug === brandSlug);

  if (!brand) return null;

  return (
    <div className="container-page py-10">
      <SectionHeading
        eyebrow="Mua bán ô tô"
        title={`Ô tô cũ ${brand.name}`}
        description={`Toàn bộ xe ${brand.name} đã qua sử dụng đang có tại showroom.`}
      />
      <CarListing cars={cars} initialBrand={brand.slug} />
    </div>
  );
}
