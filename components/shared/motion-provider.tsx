"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
  Site-wide motion, driven by data attributes so components stay declarative:

  data-reveal="up|left|right|scale"  fade the element in when it scrolls into view
  data-reveal-stagger                fade the element's direct children in one by one
  data-parallax="0.15"               drift the element vertically while scrolling (strength)
  data-tilt                          3D tilt toward the pointer on hover (desktop only)
  data-magnetic                      pull the element toward the pointer on hover (desktop only)

  Everything is skipped when the visitor prefers reduced motion.
*/

const REVEAL_FROM: Record<string, gsap.TweenVars> = {
  up: { y: 40 },
  left: { x: -48 },
  right: { x: 48 },
  scale: { scale: 0.92 },
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current;
      if (!el || isAdmin) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Reading progress bar along the top of the viewport.
        if (progress.current) {
          gsap.fromTo(
            progress.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } }
          );
        }

        // Single elements: batched so a row of cards entering together staggers nicely.
        const singles = gsap.utils.toArray<HTMLElement>("[data-reveal]", el);
        singles.forEach((t) => gsap.set(t, { autoAlpha: 0, ...REVEAL_FROM[t.dataset.reveal || "up"] }));
        ScrollTrigger.batch(singles, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1, x: 0, y: 0, scale: 1,
              duration: 0.8, ease: "power3.out", stagger: 0.1, overwrite: "auto",
              // Hand transform back to CSS so Tailwind hover lifts keep working.
              clearProps: "transform",
            }),
        });

        // Groups: children cascade in once the container is reached.
        gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]", el).forEach((group) => {
          gsap.from(group.children, {
            autoAlpha: 0, y: 28, duration: 0.7, ease: "power3.out", stagger: 0.09, clearProps: "transform",
            scrollTrigger: { trigger: group, start: "top 88%", once: true },
          });
        });

        // Parallax drift, tied directly to scroll.
        gsap.utils.toArray<HTMLElement>("[data-parallax]", el).forEach((t) => {
          const strength = parseFloat(t.dataset.parallax || "0.15");
          gsap.fromTo(
            t,
            { yPercent: -strength * 50 },
            {
              yPercent: strength * 50, ease: "none",
              scrollTrigger: { trigger: t.parentElement ?? t, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });

        // Images and late-loading data shift layout after first paint.
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        const late = window.setTimeout(refresh, 1200);
        return () => {
          window.removeEventListener("load", refresh);
          window.clearTimeout(late);
        };
      });

      // Pointer effects only on devices with a real hover.
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        // Delegated, so cards rendered later (filters, tabs) work without re-binding.
        const onMove = contextSafe!((e: PointerEvent) => {
          const target = e.target as Element | null;
          const tilt = target?.closest<HTMLElement>("[data-tilt]");
          if (tilt) {
            const r = tilt.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(tilt, {
              rotationY: px * 8, rotationX: -py * 8, scale: 1.02, transformPerspective: 900,
              duration: 0.5, ease: "power2.out", overwrite: "auto",
            });
            tilt.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
            tilt.style.setProperty("--my", `${(py + 0.5) * 100}%`);
          }
          const mag = target?.closest<HTMLElement>("[data-magnetic]");
          if (mag) {
            const r = mag.getBoundingClientRect();
            gsap.to(mag, {
              x: (e.clientX - r.left - r.width / 2) * 0.25,
              y: (e.clientY - r.top - r.height / 2) * 0.35,
              duration: 0.4, ease: "power3.out", overwrite: "auto",
            });
          }
        });

        const onOut = contextSafe!((e: PointerEvent) => {
          const from = e.target as Element | null;
          const to = e.relatedTarget as Node | null;
          const tilt = from?.closest<HTMLElement>("[data-tilt]");
          if (tilt && !(to && tilt.contains(to))) {
            gsap.to(tilt, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
          }
          const mag = from?.closest<HTMLElement>("[data-magnetic]");
          if (mag && !(to && mag.contains(to))) {
            gsap.to(mag, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
          }
        });

        el.parentElement?.addEventListener("pointermove", onMove);
        el.parentElement?.addEventListener("pointerout", onOut);
        return () => {
          el.parentElement?.removeEventListener("pointermove", onMove);
          el.parentElement?.removeEventListener("pointerout", onOut);
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true }
  );

  return (
    <div ref={root} className="contents">
      {!isAdmin && (
        <div
          ref={progress}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-accent via-amber-400 to-accent"
        />
      )}
      {children}
    </div>
  );
}
