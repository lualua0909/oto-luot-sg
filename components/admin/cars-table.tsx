"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
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
import { Car } from "@/lib/types";
import { getAllCarsAdmin, deleteCar } from "@/lib/firebase/cars";
import { formatPriceTrieu } from "@/lib/utils";
import { deleteImage } from "@/lib/blob/storage";

const STATUS_LABEL: Record<Car["status"], { label: string; variant: "success" | "secondary" | "outline" }> = {
  "dang-ban": { label: "Đang bán", variant: "success" },
  "da-ban": { label: "Đã bán", variant: "secondary" },
  an: { label: "Đang ẩn", variant: "outline" },
};

export function CarsTable() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Car | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setCars(await getAllCarsAdmin());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCar(toDelete.id);
      const urls = new Set([...(toDelete.images ?? []).map((img) => img.url), toDelete.coverImage].filter(Boolean));
      await Promise.all([...urls].map((url) => deleteImage(url)));
      toast.success("Đã xóa xe.");
      setCars((c) => c.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Quản lý xe</h1>
          <p className="text-sm text-muted-foreground">{cars.length} xe trong hệ thống</p>
        </div>
        <Button asChild>
          <Link href="/admin/xe/moi">
            <Plus className="h-4 w-4" /> Thêm xe
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Chưa có xe nào. Bấm "Thêm xe" để đăng tin đầu tiên.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Xe</TableHead>
              <TableHead>Hãng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {car.coverImage && <Image src={car.coverImage} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-medium">{car.title}</p>
                      <p className="text-xs text-muted-foreground">Đời {car.year}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{car.brandName}</TableCell>
                <TableCell className="text-sm font-semibold text-accent">{formatPriceTrieu(car.priceTrieu)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_LABEL[car.status].variant}>{STATUS_LABEL[car.status].label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button asChild size="icon" variant="outline">
                      <Link href={`/admin/xe/${car.id}`} aria-label="Sửa">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setToDelete(car)} aria-label="Xóa">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa xe này?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn sắp xóa "{toDelete?.title}". Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Xóa xe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
