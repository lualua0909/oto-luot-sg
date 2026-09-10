"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { useBrands } from "@/components/shared/brands-provider";
import { T } from "@/components/shared/editable-text";

export function BrandGrid() {
  const brands = useBrands();
  return (
    <section className="container-page py-14">
      <div className="flex items-end justify-between">
        <SectionHeading
          id="home.brands"
          icon={Sparkles}
          eyebrow="Thương hiệu"
          title="Các hãng xe đang bán"
          description="Chọn nhanh theo hãng xe bạn quan tâm."
          className="mb-0"
        />
        <Link
          href="/mua-ban-o-to"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
        >
          <T id="home.brands.viewAll">Xem tất cả hãng</T> <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Infinite marquee: the list is rendered twice and the track slides by half
          its width, so the second copy lands exactly where the first started. */}
      <div className="group relative mt-6 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex w-max animate-marquee items-stretch gap-4 group-hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <Link
              key={`${b.slug}-${i}`}
              href={`/mua-ban-o-to/${b.slug}`}
              aria-hidden={i >= brands.length}
              tabIndex={i >= brands.length ? -1 : undefined}
              className="flex w-[132px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl bg-card p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:w-[148px]"
            >
              {b.logoUrl ? (
                <img src={b.logoUrl} alt="" className="h-16 w-16 object-contain" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary font-display text-base font-bold text-primary">
                  {b.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-bold leading-tight text-foreground">{b.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/mua-ban-o-to"
        className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline sm:hidden"
      >
        <T id="home.brands.viewAllMobile">Xem tất cả hãng</T> <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
