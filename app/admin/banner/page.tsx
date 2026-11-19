"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, GalleryHorizontalEnd, ImagePlus, Loader2, Replace, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getBanners, saveBanners } from "@/lib/store/banners";
import { uploadImage } from "@/lib/images/upload";
import { imageSrc } from "@/lib/images/url";
import { reportAdminError } from "@/lib/client/error-log";
import { MAX_BANNERS, type BannerSlide } from "@/lib/banners";

/** Homepage hero banners: upload, replace, reorder, remove. Old files stay in R2 (clean up in Quản lý file). */
export default function AdminBannerPage() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  /** Index being replaced, or "new" for an added slide. */
  const [target, setTarget] = useState<number | "new" | null>(null);
  const [uploading, setUploading] = useState<number | "new" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getBanners()
      .then(setSlides)
      .catch(() => toast.error("Không tải được banner."))
      .finally(() => setLoading(false));
  }, []);

  function update(next: BannerSlide[]) {
    setSlides(next);
    setDirty(true);
  }

  function pick(which: number | "new") {
    setTarget(which);
    fileInput.current?.click();
  }

  async function handleFile(file: File | undefined) {
    const which = target;
    if (fileInput.current) fileInput.current.value = "";
    if (!file || which === null) return;
    setUploading(which);
    try {
      const { url } = await uploadImage(file, "banners");
      if (which === "new") update([...slides, { url, alt: "" }]);
      else update(slides.map((s, i) => (i === which ? { ...s, url } : s)));
      toast.success("Đã tải ảnh lên. Nhấn Lưu thay đổi để áp dụng.");
    } catch (error) {
      await reportAdminError("banners.upload", error);
      toast.error(error instanceof Error && error.message ? error.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(null);
      setTarget(null);
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  }

  async function handleSave() {
    if (slides.length === 0) {
      toast.error("Cần ít nhất 1 ảnh banner.");
      return;
    }
    setSaving(true);
    try {
      await saveBanners(slides);
      setDirty(false);
      toast.success("Đã lưu banner. Trang chủ cập nhật ngay.");
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : "Không thể lưu banner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Banner trang chủ</h1>
          <p className="text-sm text-muted-foreground">Ảnh chạy ở đầu trang chủ, khung 21:9 (nên dùng ảnh ngang ≥ 1920px). Ảnh lưu trên Cloudflare R2.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading || !dirty || uploading !== null}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GalleryHorizontalEnd className="h-5 w-5 text-primary" /> Danh sách banner ({slides.length}/{MAX_BANNERS})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex flex-col gap-3 sm:flex-row">
                  <Skeleton className="aspect-[21/9] w-full rounded-lg sm:w-72" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-40" /></div>
                </div>
              ))
            : slides.map((slide, i) => (
                <div key={`${i}-${slide.url}`} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row">
                  <div className="relative aspect-[21/9] w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-72">
                    <Image src={imageSrc(slide.url)} alt={slide.alt} fill unoptimized sizes="288px" className="object-cover" />
                    {uploading === i && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    )}
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white">#{i + 1}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium">Mô tả ảnh (alt, cho SEO)</span>
                      <Input value={slide.alt} placeholder="VD: Showroom Ô TÔ LƯỚT SÀI GÒN" onChange={(e) => update(slides.map((s, j) => (j === i ? { ...s, alt: e.target.value } : s)))} />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" disabled={uploading !== null} onClick={() => pick(i)}>
                        <Replace className="h-4 w-4" /> Đổi ảnh
                      </Button>
                      <Button type="button" variant="outline" size="icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Lên trên"><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" variant="outline" size="icon" disabled={i === slides.length - 1} onClick={() => move(i, 1)} aria-label="Xuống dưới"><ArrowDown className="h-4 w-4" /></Button>
                      <Button type="button" variant="outline" size="icon" disabled={slides.length <= 1} onClick={() => update(slides.filter((_, j) => j !== i))} aria-label="Xóa banner">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

          {!loading && slides.length < MAX_BANNERS && (
            <button
              type="button"
              onClick={() => pick("new")}
              disabled={uploading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-60"
            >
              {uploading === "new" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              {uploading === "new" ? "Đang tải lên..." : "Thêm banner"}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
