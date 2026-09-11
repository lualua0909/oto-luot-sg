"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Loader2, RefreshCw, Replace, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Brand, Car, NewsPost } from "@/lib/types";
import { getAllCarsAdmin, updateCar } from "@/lib/firebase/cars";
import { getAllNewsAdmin, updateNews } from "@/lib/firebase/news";
import { saveBrand, subscribeToBrands } from "@/lib/firebase/brands";
import { deleteImage, uploadImage } from "@/lib/blob/storage";

interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

type Filter = "all" | "used" | "unused";

function getBrandsOnce(): Promise<Brand[]> {
  return new Promise((resolve) => {
    const unsubscribe = subscribeToBrands((brands) => {
      unsubscribe();
      resolve(brands);
    });
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function BlobsManager() {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<BlobItem[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [busyUrl, setBusyUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [toReplace, setToReplace] = useState<BlobItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [res, c, n, b] = await Promise.all([
        fetch("/api/blobs", { cache: "no-store" }).then((r) => r.json()),
        getAllCarsAdmin(),
        getAllNewsAdmin(),
        getBrandsOnce(),
      ]);
      if (res.error) throw new Error(res.error);
      setBlobs((res.blobs as BlobItem[]).sort((x, y) => y.uploadedAt.localeCompare(x.uploadedAt)));
      setCars(c);
      setNews(n);
      setBrands(b);
    } catch {
      toast.error("Không tải được danh sách file.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /** url -> list of places where the file is used. */
  const usage = useMemo(() => {
    const map = new Map<string, string[]>();
    const add = (url: string | undefined, label: string) => {
      if (!url) return;
      const list = map.get(url) ?? [];
      if (!list.includes(label)) list.push(label);
      map.set(url, list);
    };
    cars.forEach((car) => {
      car.images?.forEach((img) => add(img.url, `Xe: ${car.title}`));
      add(car.coverImage, `Xe: ${car.title}`);
    });
    news.forEach((post) => add(post.coverImage, `Bài viết: ${post.title}`));
    brands.forEach((brand) => add(brand.logoUrl, `Logo: ${brand.name}`));
    return map;
  }, [cars, news, brands]);

  const visible = blobs.filter((b) => {
    if (filter === "used") return usage.has(b.url);
    if (filter === "unused") return !usage.has(b.url);
    return true;
  });
  const unusedCount = blobs.filter((b) => !usage.has(b.url)).length;

  const allVisibleSelected = visible.length > 0 && visible.every((b) => selected.has(b.url));

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((b) => (allVisibleSelected ? next.delete(b.url) : next.add(b.url)));
      return next;
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      toDelete.map(async (blob) => {
        const res = await fetch("/api/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: blob.url }),
        });
        if (!res.ok) throw new Error();
        return blob.url;
      })
    );
    const deleted = new Set(
      results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
    );
    const failed = toDelete.length - deleted.size;
    setBlobs((list) => list.filter((b) => !deleted.has(b.url)));
    setSelected((prev) => new Set([...prev].filter((url) => !deleted.has(url))));
    if (deleted.size) toast.success(`Đã xóa ${deleted.size} file.`);
    if (failed) toast.error(`${failed} file xóa thất bại, vui lòng thử lại.`);
    else setToDelete(null);
    setDeleting(false);
  }

  /** Upload the new file, point every reference to it, then remove the old blob. */
  async function replaceWith(file: File) {
    const old = toReplace;
    setToReplace(null);
    if (!old) return;
    setBusyUrl(old.url);
    try {
      const prefix = old.pathname.split("/")[0];
      const folder = prefix === "news" || prefix === "brands" ? prefix : "cars";
      const next = await uploadImage(file, folder);

      await Promise.all([
        ...cars
          .filter((car) => car.coverImage === old.url || car.images?.some((img) => img.url === old.url))
          .map((car) =>
            updateCar(car.id, {
              images: car.images.map((img) => (img.url === old.url ? next : img)),
              coverImage: car.coverImage === old.url ? next.url : car.coverImage,
            })
          ),
        ...news
          .filter((post) => post.coverImage === old.url)
          .map((post) => updateNews(post.id, { coverImage: next.url })),
        ...brands
          .filter((brand) => brand.logoUrl === old.url)
          .map((brand) => saveBrand({ ...brand, logoUrl: next.url })),
      ]);

      await deleteImage(old.url);
      toast.success("Đã thay file.");
      await load();
    } catch {
      toast.error("Thay file thất bại, vui lòng thử lại.");
    } finally {
      setBusyUrl(null);
    }
  }

  const deleteUsage = toDelete?.flatMap((b) => usage.get(b.url) ?? []) ?? [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Quản lý file</h1>
          <p className="text-sm text-muted-foreground">
            {blobs.length} file · {unusedCount} không được sử dụng
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "used", "unused"] as Filter[]).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "Tất cả" : f === "used" ? "Đang dùng" : "Không dùng"}
            </Button>
          ))}
          {selected.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setToDelete(blobs.filter((b) => selected.has(b.url)))}
            >
              <Trash2 className="h-4 w-4" /> Xóa {selected.size} file
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={load} disabled={loading} aria-label="Tải lại">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) replaceWith(file);
        }}
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Không có file nào.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
              <TableHead>File</TableHead>
              <TableHead>Đang dùng ở</TableHead>
              <TableHead>Dung lượng</TableHead>
              <TableHead>Ngày tải</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((blob) => {
              const used = usage.get(blob.url);
              const busy = busyUrl === blob.url;
              return (
                <TableRow key={blob.url} data-state={selected.has(blob.url) ? "selected" : undefined}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={selected.has(blob.url)}
                      onChange={() => toggleSelect(blob.url)}
                      aria-label="Chọn file"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={blob.url} alt="" fill sizes="64px" className="object-cover" />
                      </div>
                      <p className="line-clamp-1 max-w-[16rem] break-all text-xs text-muted-foreground">{blob.pathname}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {used ? (
                      <div className="space-y-0.5">
                        {used.map((label) => (
                          <p key={label} className="line-clamp-1">{label}</p>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline">Không dùng</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatSize(blob.size)}</TableCell>
                  <TableCell className="text-sm">{new Date(blob.uploadedAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button asChild size="icon" variant="outline">
                        <a href={blob.url} target="_blank" rel="noreferrer" aria-label="Xem">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          setToReplace(blob);
                          fileInput.current?.click();
                        }}
                        aria-label="Thay file"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Replace className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="outline" disabled={busy} onClick={() => setToDelete([blob])} aria-label="Xóa">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {toDelete && toDelete.length > 1 ? `Xóa ${toDelete.length} file?` : "Xóa file này?"}
            </DialogTitle>
          </DialogHeader>
          {deleteUsage.length > 0 ? (
            <p className="text-sm text-destructive">
              File đang được dùng ở: {[...new Set(deleteUsage)].join(", ")}. Xóa sẽ làm ảnh bị lỗi ở những nơi này.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">File không được sử dụng. Hành động này không thể hoàn tác.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Xóa file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
