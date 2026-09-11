"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { CarImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { T } from "@/components/shared/editable-text";

export function CarGallery({ images, title }: { images: CarImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const list = images.length > 0 ? images : [{ url: "", path: "" }];

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + list.length) % list.length);
  }, [list.length]);
  const next = useCallback(() => {
    setActive((a) => (a + 1) % list.length);
  }, [list.length]);

  function openZoom(index: number) {
    if (!list[index]?.url) return;
    setActive(index);
    setZoomed(true);
  }

  // Keyboard control + no background scrolling while the lightbox is open.
  useEffect(() => {
    if (!zoomed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomed, prev, next]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted sm:hidden">
        {list[active]?.url ? (
          <Image
            onClick={() => openZoom(active)}
            alt={`${title} - ảnh ${active + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="cursor-zoom-in object-cover"
            src={list[active].url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <T id="car.gallery.noImage">Chưa có ảnh</T>
          </div>
        )}

        {list.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Ảnh sau"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1}/{list.length}
            </div>
          </>
        )}
      </div>

      <div className="hidden h-[440px] grid-cols-4 grid-rows-2 gap-1 bg-background sm:grid">
        <button type="button" onClick={() => openZoom(0)} className="relative col-span-2 row-span-2 cursor-zoom-in overflow-hidden bg-muted">
          {list[0]?.url ? <Image src={list[0].url} alt={`${title} - ảnh 1`} fill priority sizes="(max-width: 1024px) 50vw, 45vw" className="object-cover transition-transform duration-300 hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><T id="car.gallery.noImage">Chưa có ảnh</T></div>}
        </button>
        {list.slice(1, 5).map((img, index) => {
          const imageIndex = index + 1;
          const isLastVisible = imageIndex === Math.min(list.length - 1, 4) && list.length > 5;
          return (
            <button
              key={img.path || imageIndex}
              type="button"
              onClick={() => openZoom(imageIndex)}
              className={cn(
                "relative cursor-zoom-in overflow-hidden bg-muted",
                imageIndex === active && "ring-2 ring-inset ring-primary"
              )}
            >
              {img.url && <Image src={img.url} alt="" fill sizes="20vw" className="object-cover transition-transform duration-300 hover:scale-105" />}
              {isLastVisible && (
                <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 text-sm font-semibold text-white"><Images className="h-4 w-4" /> +{list.length - 5}</span>
              )}
            </button>
          );
        })}
        {list.length === 1 && <div className="col-span-2 row-span-2 bg-muted" />}
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} - ảnh phóng to`}
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            onClick={() => setZoomed(false)}
            aria-label="Đóng"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
            {list[active]?.url && (
              <Image
                src={list[active].url}
                alt={`${title} - ảnh ${active + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>

          {list.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Ảnh trước"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Ảnh sau"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white">
                {active + 1}/{list.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
