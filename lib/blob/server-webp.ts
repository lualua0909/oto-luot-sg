import sharp from "sharp";

/** Server-side source of truth for car photo uploads. */
export const CAR_IMAGE_MAX_BYTES = 80 * 1024;
export const CAR_IMAGE_MAX_DIMENSION = 1920;

const MIN_QUALITY = 45;
const MAX_QUALITY = 84;
const MAX_RESIZE_ATTEMPTS = 12;

export interface CompressedCarImage {
  data: Buffer;
  width: number;
  height: number;
  unchanged: boolean;
}

/** Preserve aspect ratio and choose the highest WebP quality under 80 KiB. */
export async function compressCarImage(input: Buffer): Promise<CompressedCarImage> {
  const metadata = await sharp(input).metadata();
  if (!metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) {
    throw new Error("Ảnh xe phải là ảnh tĩnh hợp lệ.");
  }

  const originalLongEdge = Math.max(metadata.width, metadata.height);
  if (
    metadata.format === "webp" &&
    input.length <= CAR_IMAGE_MAX_BYTES &&
    originalLongEdge <= CAR_IMAGE_MAX_DIMENSION
  ) {
    return { data: input, width: metadata.width, height: metadata.height, unchanged: true };
  }

  let longEdge = Math.min(CAR_IMAGE_MAX_DIMENSION, originalLongEdge);
  for (let attempt = 0; attempt < MAX_RESIZE_ATTEMPTS; attempt++) {
    const encode = (quality: number) =>
      sharp(input)
        .rotate()
        .resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    const highest = await encode(MAX_QUALITY);
    if (highest.data.length <= CAR_IMAGE_MAX_BYTES) {
      return { data: highest.data, width: highest.info.width, height: highest.info.height, unchanged: false };
    }

    const lowest = await encode(MIN_QUALITY);
    if (lowest.data.length <= CAR_IMAGE_MAX_BYTES) {
      let best = lowest;
      let low = MIN_QUALITY;
      let high = MAX_QUALITY;
      for (let i = 0; i < 6; i++) {
        const quality = Math.floor((low + high + 1) / 2);
        if (quality === low) break;
        const candidate = await encode(quality);
        if (candidate.data.length <= CAR_IMAGE_MAX_BYTES) {
          best = candidate;
          low = quality;
        } else {
          high = quality - 1;
        }
      }
      return { data: best.data, width: best.info.width, height: best.info.height, unchanged: false };
    }

    if (longEdge <= 1) break;
    const estimatedScale = Math.sqrt(CAR_IMAGE_MAX_BYTES / lowest.data.length) * 0.95;
    const scale = Math.max(0.7, Math.min(0.9, estimatedScale));
    longEdge = Math.max(1, Math.min(longEdge - 1, Math.floor(longEdge * scale)));
  }

  throw new Error("Không thể nén ảnh xe dưới 80 KiB. Vui lòng thử ảnh khác.");
}
