"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, X } from "lucide-react";
import type { Car } from "@/lib/types";
import { formatPriceTrieu } from "@/lib/utils";
import { T } from "@/components/shared/editable-text";
import { ResilientCarImage } from "@/components/car/resilient-car-image";

const STORAGE_KEY = "recently-viewed-cars";
const MAX_ITEMS = 8;

/** Just enough of a car to draw its card, so the home page needs no database call. */
export type RecentCar = Pick<
  Car,
  | "id"
  | "slug"
  | "title"
  | "brandName"
  | "year"
  | "priceTrieu"
  | "odoKm"
  | "coverImage"
> & {
  viewedAt: number;
};

function readRecent(): RecentCar[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((c) => c && c.id && c.slug) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: RecentCar[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked (private mode) — the feature just stays off.
  }
}

/** Put on the car detail page: moves this car to the front of the viewed list. */
export function TrackRecentlyViewed({
  car,
}: {
  car: Omit<RecentCar, "viewedAt">;
}) {
  const { id, slug, title, brandName, year, priceTrieu, odoKm, coverImage } =
    car;
  useEffect(() => {
    const entry: RecentCar = {
      id,
      slug,
      title,
      brandName,
      year,
      priceTrieu,
      odoKm,
      coverImage,
      viewedAt: Date.now(),
    };
    writeRecent(
      [entry, ...readRecent().filter((c) => c.id !== id)].slice(0, MAX_ITEMS),
    );
  }, [id, slug, title, brandName, year, priceTrieu, odoKm, coverImage]);
  return null;
}

/** Home page section. Renders nothing until the visitor has viewed at least one car. */
export function RecentlyViewedSection() {
  const [cars, setCars] = useState<RecentCar[]>([]);

  useEffect(() => {
    setCars(readRecent());
  }, []);

  function clearAll() {
    writeRecent([]);
    setCars([]);
  }

  if (cars.length === 0) return null;

  return (
    <section className="container-page pt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
          <History className="h-5 w-5 text-accent" />
          <T id="home.recentlyViewed.title">Xe đã xem gần đây</T>
        </h2>
        <button
          type="button"
          onClick={clearAll}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />{" "}
          <T id="home.recentlyViewed.clear">Xoá lịch sử</T>
        </button>
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/xe/${car.slug}`}
            className="group w-[200px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg sm:w-[230px]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {car.coverImage ? (
                <ResilientCarImage
                  sources={[car.coverImage]}
                  alt={car.title}
                  fill
                  sizes="230px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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
            <div className="space-y-1.5 p-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                {car.brandName} · {car.year}
                {car.odoKm ? ` · ${car.odoKm.toLocaleString("vi-VN")} km` : ""}
              </p>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                {car.title}
              </h3>
              <p className="font-display font-bold text-destructive">
                {formatPriceTrieu(car.priceTrieu)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
