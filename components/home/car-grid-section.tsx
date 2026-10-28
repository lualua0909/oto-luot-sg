"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Car } from "@/lib/types";
import { formatPriceTrieu } from "@/lib/utils";
import { T } from "@/components/shared/editable-text";
import { ResilientCarImage } from "@/components/car/resilient-car-image";

const ALL = "Tất cả";

function CarSlide({ car }: { car: Car }) {
  return (
    <Link
      href={`/xe/${car.slug}`}
      className="group fx-spotlight w-[248px] shrink-0 snap-start overflow-hidden rounded-xl bg-card shadow-lg ring-2 ring-transparent transition-[box-shadow] duration-300 hover:shadow-2xl hover:ring-accent sm:w-[268px]"
    >
      <div className="fx-shine relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {car.coverImage || car.images?.length ? (
          <ResilientCarImage
            sources={[car.coverImage, ...(car.images ?? []).map((image) => image.url)]}
            alt={car.title}
            fill
            sizes="270px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <T id="car.card.noImage">Chưa có ảnh</T>
              </div>
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <T id="car.card.noImage">Chưa có ảnh</T>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground">
            {car.brandName}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{car.year}</span>
          {car.status === "dang-coc" && <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[11px] font-semibold text-accent">Đang cọc</span>}
        </div>
        <h3 className="line-clamp-1 font-display text-lg font-bold text-primary transition-colors group-hover:text-accent">{car.title}</h3>
        <p className="font-semibold text-destructive">
          {formatPriceTrieu(car.priceTrieu)} <span className="text-xs text-muted-foreground">VNĐ</span>
        </p>
      </div>
    </Link>
  );
}

export function CarGridSection({ cars }: { cars: Car[] }) {
  const [tab, setTab] = useState(ALL);
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Only offer tabs for body types that actually have a car in stock.
  const tabs = useMemo(
    () => [ALL, ...Array.from(new Set(cars.map((c) => c.bodyType)))],
    [cars]
  );
  const visible = tab === ALL ? cars : cars.filter((c) => c.bodyType === tab);

  // The dots count card-widths of scrolling, not cars, so it can only be measured
  // after layout — and it changes when the viewport is resized.
  const [pageCount, setPageCount] = useState(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () =>
      setPageCount(el.clientWidth === 0 ? 0 : Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible.length]);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="container-page py-14">
      <div data-reveal="scale" className="relative rounded-3xl bg-primary px-5 py-8 text-primary-foreground sm:px-8 sm:py-10">
        <h2 data-reveal="left" className="font-display text-xl font-bold uppercase tracking-wide text-accent sm:text-2xl">
          <T id="home.cars.title">Xe đang bán</T>
        </h2>

        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-white/20 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setPage(0);
                trackRef.current?.scrollTo({ left: 0 });
              }}
              className={`shrink-0 border-b-2 px-3 pb-2.5 text-sm transition-colors ${
                tab === t
                  ? "border-accent font-semibold text-white"
                  : "border-transparent text-primary-foreground/70 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-white/25 p-10 text-center text-primary-foreground/70">
            <T id="home.cars.empty">Chưa có xe nào được đăng. Vào trang quản trị (/admin) để thêm xe đầu tiên.</T>
          </div>
        ) : (
          <>
            <div
              ref={trackRef}
              onScroll={onScroll}
              data-reveal-stagger
              className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {visible.map((car) => (
                <CarSlide key={car.id} car={car} />
              ))}
            </div>

            {pageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  aria-label="Xem xe trước"
                  className="absolute left-1 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-all hover:scale-110 hover:bg-accent md:flex"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  aria-label="Xem xe tiếp theo"
                  className="absolute right-1 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-all hover:scale-110 hover:bg-accent md:flex"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="mt-6 flex justify-center gap-2">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Trang ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === page ? "w-6 bg-accent" : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="mt-7 text-center">
          <Link
            href="/mua-ban-o-to"
            data-magnetic
            className="group fx-shine inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 transition-shadow hover:shadow-xl hover:shadow-accent/50"
          >
            <T id="home.cars.viewAll">Xem tất cả</T> <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
