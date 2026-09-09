"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/image-uploader";
import { BODY_TYPES, BRANDS } from "@/lib/constants";
import { useBrands } from "@/components/shared/brands-provider";
import { Car, CarImage } from "@/lib/types";
import { CarInput, createCar, updateCar } from "@/lib/firebase/cars";

export function CarForm({ car }: { car?: Car }) {
  const router = useRouter();
  const brands = useBrands();
  const isEdit = !!car;

  const [brand, setBrand] = useState(car?.brand ?? BRANDS[0].slug);
  const [bodyType, setBodyType] = useState(car?.bodyType ?? BODY_TYPES[0]);
  const [transmission, setTransmission] = useState<Car["transmission"]>(car?.transmission ?? "Số tự động");
  const [fuel, setFuel] = useState<Car["fuel"]>(car?.fuel ?? "Xăng");
  const [status, setStatus] = useState<Car["status"]>(car?.status ?? "dang-ban");
  const [images, setImages] = useState<CarImage[]>(car?.images ?? []);
  const [coverImage, setCoverImage] = useState(car?.coverImage ?? "");
  const [isFeatured, setIsFeatured] = useState(car?.isFeatured ?? false);
  const [isVerified, setIsVerified] = useState(car?.isVerified ?? true);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    if (!title) {
      toast.error("Vui lòng nhập tên xe.");
      return;
    }
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh xe.");
      return;
    }

    const brandName = brands.find((b) => b.slug === brand)?.name ?? brand;

    const input: CarInput = {
      title,
      brand,
      brandName,
      model: String(data.get("model") || "").trim(),
      year: Number(data.get("year")) || new Date().getFullYear(),
      priceTrieu: Number(data.get("priceTrieu")) || 0,
      odoKm: data.get("odoKm") ? Number(data.get("odoKm")) : null,
      fuel,
      transmission,
      bodyType: bodyType as Car["bodyType"],
      color: String(data.get("color") || ""),
      seats: data.get("seats") ? Number(data.get("seats")) : undefined,
      location: String(data.get("location") || "").trim(),
      description: String(data.get("description") || "").trim(),
      highlights: String(data.get("highlights") || "")
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      images,
      coverImage: coverImage || images[0]?.url || "",
      isFeatured,
      isVerified,
      status,
    };

    setSaving(true);
    try {
      if (isEdit && car) {
        await updateCar(car.id, input);
        toast.success("Đã cập nhật xe.");
      } else {
        await createCar(input);
        toast.success("Đã thêm xe mới.");
      }
      router.push("/admin/xe");
      router.refresh();
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ảnh xe
        </h2>
        <ImageUploader
          folder="cars"
          images={images}
          onChange={setImages}
          coverImage={coverImage}
          onCoverChange={setCoverImage}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <h2 className="col-span-full font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Thông tin cơ bản
        </h2>

        <div className="col-span-full space-y-1.5">
          <Label htmlFor="title">Tên xe hiển thị</Label>
          <Input id="title" name="title" defaultValue={car?.title} placeholder="Vios 2018 số tự động form mới" required />
        </div>

        <div className="space-y-1.5">
          <Label>Hãng xe</Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="model">Dòng xe (model)</Label>
          <Input id="model" name="model" defaultValue={car?.model} placeholder="Vios" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Năm sản xuất</Label>
          <Input id="year" name="year" type="number" defaultValue={car?.year ?? new Date().getFullYear()} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priceTrieu">Giá bán (triệu VNĐ)</Label>
          <Input id="priceTrieu" name="priceTrieu" type="number" defaultValue={car?.priceTrieu} placeholder="330" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="odoKm">Số km đã đi</Label>
          <Input id="odoKm" name="odoKm" type="number" defaultValue={car?.odoKm ?? undefined} placeholder="68000" />
        </div>

        <div className="space-y-1.5">
          <Label>Loại xe</Label>
          <Select value={bodyType} onValueChange={(v) => setBodyType(v as Car["bodyType"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BODY_TYPES.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Hộp số</Label>
          <Select value={transmission} onValueChange={(v) => setTransmission(v as Car["transmission"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Số tự động">Số tự động</SelectItem>
              <SelectItem value="Số sàn">Số sàn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Nhiên liệu</Label>
          <Select value={fuel} onValueChange={(v) => setFuel(v as Car["fuel"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Xăng">Xăng</SelectItem>
              <SelectItem value="Dầu (Diesel)">Dầu (Diesel)</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Điện">Điện</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Màu xe</Label>
          <Input id="color" name="color" defaultValue={car?.color} placeholder="Trắng" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seats">Số chỗ ngồi</Label>
          <Input id="seats" name="seats" type="number" defaultValue={car?.seats} placeholder="5" />
        </div>

        <div className="col-span-full space-y-1.5">
          <Label htmlFor="location">Địa chỉ xem xe</Label>
          <Input
            id="location"
            name="location"
            defaultValue={car?.location ?? "507 Lê Đức Anh, Khu phố 16, Phường Bình Hưng Hòa, TP Hồ Chí Minh"}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Mô tả & điểm nổi bật
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="highlights">Điểm nổi bật (mỗi dòng 1 ý, ví dụ: "Xe zin tuyệt đối")</Label>
          <Textarea
            id="highlights"
            name="highlights"
            defaultValue={car?.highlights?.join("\n")}
            placeholder={"Xe zin tuyệt đối\nBao rút hồ sơ\nMột đời chủ"}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Mô tả chi tiết</Label>
          <Textarea id="description" name="description" defaultValue={car?.description} rows={6} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3">
        <h2 className="col-span-full font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Trạng thái hiển thị
        </h2>
        <div className="space-y-1.5">
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Car["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dang-ban">Đang bán (hiển thị công khai)</SelectItem>
              <SelectItem value="da-ban">Đã bán</SelectItem>
              <SelectItem value="an">Ẩn (nháp)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Hiển thị nổi bật ở trang chủ
        </label>
        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm">
          <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Gắn nhãn "Đã kiểm định"
        </label>
      </section>

      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <X className="h-4 w-4" /> Hủy
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Lưu thay đổi" : "Đăng xe"}
        </Button>
      </div>
    </form>
  );
}
