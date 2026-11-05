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
import { getAllCarsAdmin, updateCar } from "@/lib/store/cars";
import { getAllNewsAdmin, updateNews } from "@/lib/store/news";
import { saveBrand, subscribeToBrands } from "@/lib/store/brands";
import { deleteImage, uploadImage } from "@/lib/images/upload";
import { imageSrc } from "@/lib/images/url";
import { idToken } from "@/lib/store/session";

interface FileItem {
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

/** Every image in R2, where it is used, and tools to replace or delete it. */
export function FilesManager() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<FileItem[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [busyUrl, setBusyUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [toReplace, setToReplace] = useState<FileItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [res, c, n, b] = await Promise.all([
        idToken().then((t) => fetch("/api/images", { cache: "no-store", headers: { Authorization: `Bearer ${t}` } })).then((r) => r.json()),
        getAllCarsAdmin(),
        getAllNewsAdmin(),
        getBrandsOnce(),
      ]);
      if (res.error) throw new Error(res.error);
      setItems((res.files as FileItem[]).sort((x, y) => y.uploadedAt.localeCompare(x.uploadedAt)));
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

  const visible = items.filter((b) => {
    if (filter === "used") return usage.has(b.url);
    if (filter === "unused") return !usage.has(b.url);
    return true;
  });
  const unusedCount = items.filter((b) => !usage.has(b.url)).length;

  const selectableVisible = visible.filter((b) => !usage.has(b.url));
  const allVisibleSelected =
    selectableVisible.length > 0 && selectableVisible.every((b) => selected.has(b.url));

  function toggleSelect(url: string) {
    if (usage.has(url)) return;
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
      selectableVisible.forEach((b) =>
        allVisibleSelected ? next.delete(b.url) : next.add(b.url)
      );
      return next;
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const safeToDelete = toDelete.filter((item) => !usage.has(item.url));
    if (safeToDelete.length !== toDelete.length) {
      toast.error("Không thể xóa file đang được sử dụng.");
      setToDelete(null);
      return;
    }
    setDeleting(true);
    const results = await Promise.allSettled(
      safeToDelete.map(async (item) => {
        await deleteImage(item.url);
        return item.url;
      })
    );
    const deleted = new Set(
      results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
    );
    const failed = safeToDelete.length - deleted.size;
    setItems((list) => list.filter((b) => !deleted.has(b.url)));
    setSelected((prev) => new Set([...prev].filter((url) => !deleted.has(url))));
    if (deleted.size) toast.success(`Đã xóa ${deleted.size} file.`);
    if (failed) toast.error(`${failed} file xóa thất bại, vui lòng thử lại.`);
    else setToDelete(null);
    setDeleting(false);
  }

  /** Upload the new file, point every reference to it, then remove the old file. */
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

      await deleteImage(old.url).catch(() => {
        // The replacement is already referenced safely; the old file can be
        // removed later from the unused-files filter.
      });
      toast.success("Đã thay file.");
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message.includes("nén ảnh") || message.includes("WebP") || message.includes("xử lý ảnh")
        ? message
        : "Thay file thất bại, vui lòng thử lại.");
    } finally {
      setBusyUrl(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Quản lý file</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} file · {unusedCount} không được sử dụng
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
              onClick={() => setToDelete(items.filter((b) => selected.has(b.url)))}
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
            {visible.map((item) => {
              const used = usage.get(item.url);
              const busy = busyUrl === item.url;
              return (
                <TableRow key={item.url} data-state={selected.has(item.url) ? "selected" : undefined}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={selected.has(item.url)}
                      disabled={Boolean(used)}
                      onChange={() => toggleSelect(item.url)}
                      aria-label={used ? "File đang được sử dụng" : "Chọn file"}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={imageSrc(item.url)} unoptimized alt="" fill sizes="64px" className="object-cover" />
                      </div>
                      <p className="line-clamp-1 max-w-[16rem] break-all text-xs text-muted-foreground">{item.pathname}</p>
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
                  <TableCell className="text-sm">{formatSize(item.size)}</TableCell>
                  <TableCell className="text-sm">{new Date(item.uploadedAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button asChild size="icon" variant="outline">
                        <a href={item.url} target="_blank" rel="noreferrer" aria-label="Xem">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          setToReplace(item);
                          fileInput.current?.click();
                        }}
                        aria-label="Thay file"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Replace className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="outline" disabled={busy || Boolean(used)} onClick={() => setToDelete([item])} aria-label={used ? "Không thể xóa file đang dùng" : "Xóa"}>
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
          <p className="text-sm text-muted-foreground">File không được sử dụng. Hành động này không thể hoàn tác.</p>
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
