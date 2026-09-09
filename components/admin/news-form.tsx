"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import { NewsPost, CarImage } from "@/lib/types";
import { NewsInput, createNews, updateNews } from "@/lib/firebase/news";

export function NewsForm({ post }: { post?: NewsPost }) {
  const router = useRouter();
  const isEdit = !!post;
  const [images, setImages] = useState<CarImage[]>(post?.coverImage ? [{ url: post.coverImage, path: "" }] : []);
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? true);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    const input: NewsInput = {
      title,
      excerpt: String(data.get("excerpt") || "").trim(),
      content: String(data.get("content") || "").trim(),
      coverImage: coverImage || images[0]?.url || "",
      isPublished,
    };

    setSaving(true);
    try {
      if (isEdit && post) {
        await updateNews(post.id, input);
        toast.success("Đã cập nhật bài viết.");
      } else {
        await createNews(input);
        toast.success("Đã đăng bài viết.");
      }
      router.push("/admin/tin-tuc");
      router.refresh();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ảnh bìa
        </h2>
        <ImageUploader folder="news" images={images} onChange={setImages} coverImage={coverImage} onCoverChange={setCoverImage} />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input id="title" name="title" defaultValue={post?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="excerpt">Mô tả ngắn (hiển thị ở danh sách bài viết)</Label>
          <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">Nội dung bài viết</Label>
          <Textarea id="content" name="content" defaultValue={post?.content} rows={12} />
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Xuất bản công khai
        </label>
      </section>

      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <X className="h-4 w-4" /> Hủy
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Lưu thay đổi" : "Đăng bài"}
        </Button>
      </div>
    </form>
  );
}
