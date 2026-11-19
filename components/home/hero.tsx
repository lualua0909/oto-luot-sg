"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BannerSlide } from "@/lib/banners";

const INTERVAL_MS = 5000;

export function Hero({ slides }: { slides: BannerSlide[] }) {
  const [index, setIndex] = useState(0);

  const count = slides.length;

  // Autoplay restarts whenever the slide changes, so a manual click also resets the timer.
  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [index, count]);

  const go = (i: number) => setIndex((i + count) % count);

  return (
    <section className="group relative w-full overflow-hidden bg-primary">
      <div className="relative h-[50vh] w-full md:h-auto md:aspect-[21/9]">
        {/* Taller than the frame so the parallax drift never shows an edge. */}
        <div data-parallax="0.15" className="absolute inset-x-0 -inset-y-[12%]">
        {slides.map((slide, i) => (
          <Image
            key={`${i}-${slide.url}`}
            src={slide.url}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${i === index ? "fx-kenburns opacity-100" : "opacity-0"}`}
          />
        ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      {count > 1 && (
        <>
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Ảnh trước"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:scale-110 hover:bg-black/50 md:-translate-x-4 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 [transition:opacity_.3s,transform_.3s,background-color_.2s]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Ảnh tiếp theo"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:scale-110 hover:bg-black/50 md:translate-x-4 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 [transition:opacity_.3s,transform_.3s,background-color_.2s]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={`${i}-${slide.url}`}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ảnh ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
        </>
      )}
    </section>
  );
}
