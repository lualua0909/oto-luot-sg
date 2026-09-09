"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { CarImage } from "@/lib/types";
import { uploadImage, deleteImage } from "@/lib/blob/storage";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  folder: "cars" | "news";
  images: CarImage[];
  onChange: (images: CarImage[]) => void;
  coverImage?: string;
  onCoverChange?: (url: string) => void;
}

function uploadErrorMessage(error: unknown) {
  const message = (error as { message?: string }).message ?? "";

  if (message.includes("BLOB_READ_WRITE_TOKEN")) {
    return "Chưa cấu hình Vercel Blob. Vào Vercel → Storage → Blob để tạo store và thêm BLOB_READ_WRITE_TOKEN.";
  }
  if (message.toLowerCase().includes("content type")) {
    return "Định dạng ảnh không được hỗ trợ.";
  }
  if (message.toLowerCase().includes("maximum") || message.toLowerCase().includes("too large")) {
    return "Ảnh vượt quá dung lượng cho phép (10MB).";
  }
  return "Tải ảnh thất bại. Hãy kiểm tra cấu hình Vercel Blob.";
}

export function ImageUploader({ folder, images, onChange, coverImage, onCoverChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: CarImage[] = [];
      let i = 0;
      for (const file of Array.from(files)) {
        i++;
        const img = await uploadImage(file, folder, (pct) =>
          setProgress(Math.round(((i - 1) * 100 + pct) / files.length))
        );
        uploaded.push(img);
      }
      const next = [...images, ...uploaded];
      onChange(next);
      if (onCoverChange && !coverImage && next[0]) onCoverChange(next[0].url);
      toast.success(`Đã tải lên ${uploaded.length} ảnh.`);
    } catch (err) {
      console.error("Vercel Blob upload failed", err);
      toast.error(uploadErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(img: CarImage) {
    onChange(images.filter((i) => i.path !== img.path));
    if (coverImage === img.url && onCoverChange) onCoverChange(images[0]?.url ?? "");
    await deleteImage(img.url);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 py-8 text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Đang tải lên... {progress}%
          </>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            Nhấn để chọn ảnh (có thể chọn nhiều ảnh cùng lúc)
          </>
        )}
      </button>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {images.map((img) => (
            <div
              key={img.path}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2",
                coverImage === img.url ? "border-accent" : "border-transparent"
              )}
            >
              <Image src={img.url} alt="" fill sizes="15vw" className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                {onCoverChange && (
                  <button
                    type="button"
                    title="Đặt làm ảnh đại diện"
                    onClick={() => onCoverChange(img.url)}
                    className="rounded-full bg-white p-1.5 text-accent hover:bg-accent hover:text-white"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Xóa ảnh"
                  onClick={() => handleRemove(img)}
                  className="rounded-full bg-white p-1.5 text-destructive hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {coverImage === img.url && (
                <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                  Đại diện
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
