"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { useBrands } from "@/components/shared/brands-provider";

export function BrandGrid() {
  const brands = useBrands();
  return (
    <section className="container-page py-14">
      <div className="flex items-end justify-between">
        <SectionHeading
          eyebrow="Thương hiệu"
          title="Các hãng xe đang bán"
          description="Chọn nhanh theo hãng xe bạn quan tâm."
          className="mb-0"
        />
        <Link
          href="/mua-ban-o-to"
          className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:block"
        >
          Xem tất cả hãng →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {brands.map((b) => (
          <Link
            key={b.slug}
            href={`/mua-ban-o-to/${b.slug}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary hover:shadow-md"
          >
            {b.logoUrl ? (
              <img src={b.logoUrl} alt="" className="h-11 w-11 rounded-full object-contain" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
                {b.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-medium leading-tight text-foreground">{b.name}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/mua-ban-o-to"
        className="mt-5 block text-center text-sm font-semibold text-primary hover:underline sm:hidden"
      >
        Xem tất cả hãng →
      </Link>
    </section>
  );
}
