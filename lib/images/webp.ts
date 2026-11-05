/**
 * Image standard for the car website.
 *
 * Browser-side optimization for news images and brand logos. Car photos use
 * the matching server-side standard in server-webp.ts before they enter cars/.
 */
const MAX_DIMENSION = 1920;
const TARGET_SIZE_BYTES = 80 * 1024;
const MAX_QUALITY = 0.84;
const MIN_QUALITY = 0.45;
const QUALITY_SEARCH_STEPS = 6;
const MAX_RESIZE_ATTEMPTS = 12;

interface EncodedImage {
  blob: Blob;
  fitsTarget: boolean;
}

function webpName(name: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.webp`;
}

function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không thể nén ảnh sang WebP."));
          return;
        }
        // Browsers may fall back to PNG when the requested encoder is not
        // supported. Never upload that result with a misleading .webp name.
        if (blob.type !== "image/webp") {
          reject(new Error("Trình duyệt này không hỗ trợ nén ảnh WebP."));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

/** Find the highest WebP quality that stays within the size target. */
async function encodeWithinTarget(canvas: HTMLCanvasElement): Promise<EncodedImage> {
  const highestQuality = await encodeWebp(canvas, MAX_QUALITY);
  if (highestQuality.size <= TARGET_SIZE_BYTES) {
    return { blob: highestQuality, fitsTarget: true };
  }

  const lowestQuality = await encodeWebp(canvas, MIN_QUALITY);
  if (lowestQuality.size > TARGET_SIZE_BYTES) {
    return { blob: lowestQuality, fitsTarget: false };
  }

  let best = lowestQuality;
  let low = MIN_QUALITY;
  let high = MAX_QUALITY;

  for (let i = 0; i < QUALITY_SEARCH_STEPS; i++) {
    const quality = (low + high) / 2;
    const candidate = await encodeWebp(canvas, quality);
    if (candidate.size <= TARGET_SIZE_BYTES) {
      best = candidate;
      low = quality;
    } else {
      high = quality;
    }
  }

  return { blob: best, fitsTarget: true };
}

function drawBitmap(
  canvas: HTMLCanvasElement,
  bitmap: ImageBitmap,
  width: number,
  height: number
): void {
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không thể xử lý ảnh trên trình duyệt này.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
}

/**
 * Resize and compress a non-car image before uploading.
 *
 * Already-small WebP files are kept untouched. Other images are resized to a
 * maximum 1920px long edge, then quality is searched automatically. If the
 * result is still over 80 KiB at minimum quality, dimensions are reduced in
 * steps until the target is met. Very detailed images may need to be smaller
 * than the reference photo to meet the same file size.
 * Animated GIFs are kept untouched so their animation is not lost.
 */
export async function toWebp(file: File): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) {
    return file;
  }

  const bitmap = await createImageBitmap(file);

  try {
    const originalLongEdge = Math.max(bitmap.width, bitmap.height);
    if (
      file.type === "image/webp" &&
      file.size <= TARGET_SIZE_BYTES &&
      originalLongEdge <= MAX_DIMENSION
    ) {
      return file;
    }

    const initialScale = Math.min(1, MAX_DIMENSION / originalLongEdge);
    let width = Math.max(1, Math.round(bitmap.width * initialScale));
    let height = Math.max(1, Math.round(bitmap.height * initialScale));
    const canvas = document.createElement("canvas");
    for (let attempt = 0; attempt < MAX_RESIZE_ATTEMPTS; attempt++) {
      drawBitmap(canvas, bitmap, width, height);
      const encoded = await encodeWithinTarget(canvas);

      if (encoded.fitsTarget) {
        return new File([encoded.blob], webpName(file.name), {
          type: "image/webp",
          lastModified: Date.now(),
        });
      }

      const longEdge = Math.max(width, height);
      if (longEdge <= 1) break;

      // File size is roughly proportional to pixel count. Use its square root
      // to estimate the next dimensions, with conservative bounds per pass.
      const estimatedScale = Math.sqrt(TARGET_SIZE_BYTES / encoded.blob.size) * 0.95;
      const resizeScale = Math.max(0.7, Math.min(0.9, estimatedScale));
      const nextLongEdge = Math.max(1, Math.min(longEdge - 1, Math.floor(longEdge * resizeScale)));
      const dimensionScale = nextLongEdge / longEdge;
      width = Math.max(1, Math.round(width * dimensionScale));
      height = Math.max(1, Math.round(height * dimensionScale));
    }

    throw new Error("Không thể nén ảnh dưới 80 KB. Vui lòng thử ảnh khác.");
  } finally {
    bitmap.close();
  }
}
