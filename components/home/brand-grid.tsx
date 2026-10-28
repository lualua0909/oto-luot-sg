"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { useBrands } from "@/components/shared/brands-provider";
import { T } from "@/components/shared/editable-text";
import { imageSrc } from "@/lib/blob/image-url";

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
          data-reveal="right"
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary sm:flex"
        >
          <span className="fx-underline"><T id="home.brands.viewAll">Xem tất cả hãng</T></span> <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Infinite marquee: the list is rendered twice and the track slides by half
          its width, so the second copy lands exactly where the first started. */}
      <div data-reveal="up" className="group relative mt-6 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex w-max animate-marquee items-stretch gap-4 group-hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <Link
              key={`${b.slug}-${i}`}
              href={`/mua-ban-o-to/${b.slug}`}
              aria-hidden={i >= brands.length}
              tabIndex={i >= brands.length ? -1 : undefined}
              className="group/brand fx-shine flex w-[132px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl bg-card p-5 text-center shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-accent/50 sm:w-[148px]"
            >
              {b.logoUrl ? (
                <img src={imageSrc(b.logoUrl)} loading="lazy" alt="" className="h-16 w-16 object-contain grayscale-[35%] transition-all duration-500 group-hover/brand:-rotate-6 group-hover/brand:scale-[1.15] group-hover/brand:grayscale-0" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary font-display text-base font-bold text-primary transition-all duration-500 group-hover/brand:rotate-[360deg] group-hover/brand:bg-primary group-hover/brand:text-primary-foreground">
                  {b.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-bold leading-tight text-foreground transition-colors group-hover/brand:text-accent">{b.name}</span>
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
