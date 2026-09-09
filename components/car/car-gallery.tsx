"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { CarImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CarGallery({ images, title }: { images: CarImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ url: "", path: "" }];

  function prev() {
    setActive((a) => (a - 1 + list.length) % list.length);
  }
  function next() {
    setActive((a) => (a + 1) % list.length);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted sm:hidden">
        {list[active]?.url ? (
          <Image
            src={list[active].url}
            alt={`${title} - ảnh ${active + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chưa có ảnh
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

      <div className="hidden h-[440px] grid-cols-4 gap-1 bg-background sm:grid">
        <button type="button" onClick={() => setActive(0)} className="relative col-span-3 row-span-2 overflow-hidden bg-muted">
          {list[0]?.url ? <Image src={list[0].url} alt={`${title} - ảnh 1`} fill priority sizes="(max-width: 1024px) 75vw, 65vw" className="object-cover transition-transform duration-300 hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có ảnh</div>}
        </button>
        {list.slice(1, 5).map((img, index) => {
          const imageIndex = index + 1;
          const isLastVisible = imageIndex === Math.min(list.length - 1, 4) && list.length > 5;
          return (
            <button
              key={img.path || imageIndex}
              type="button"
              onClick={() => setActive(imageIndex)}
              className={cn(
                "relative overflow-hidden bg-muted",
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
        {list.length === 1 && <div className="bg-muted" />}
      </div>
    </div>
  );
}
