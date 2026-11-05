"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import { imageSrc } from "@/lib/images/url";

type ResilientCarImageProps = Omit<ImageProps, "src" | "onError"> & {
  sources: Array<string | null | undefined>;
  fallback?: ReactNode;
  onAllSourcesFailed?: () => void;
};

/**
 * Car photos live in Cloudflare R2, already compressed on upload, and load straight
 * from the public R2 URL (never through a Next.js route or the image optimizer).
 * If a saved URL was deleted, try the car's other photos before showing a
 * clean fallback instead of the browser's broken-image icon.
 */
export function ResilientCarImage({
  sources,
  fallback,
  onAllSourcesFailed,
  unoptimized,
  ...props
}: ResilientCarImageProps) {
  const sourceKey = sources.filter(Boolean).join("\n");
  const candidates = useMemo(
    () => [...new Set(sources.filter((source): source is string => Boolean(source)))],
    // sourceKey is the stable, value-based identity of the caller's array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceKey]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [sourceKey]);

  const original = candidates[index];
  if (!original) return fallback ?? null;
  const src = imageSrc(original);

  return (
    <Image
      {...props}
      key={src}
      src={src}
      unoptimized={unoptimized ?? true}
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex(index + 1);
        } else {
          setIndex(candidates.length);
          onAllSourcesFailed?.();
        }
      }}
    />
  );
}
