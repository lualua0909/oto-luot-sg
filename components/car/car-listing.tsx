"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Car, CarFilters } from "@/lib/types";
import { applyCarFilters } from "@/lib/firebase/cars";
import { CarCard } from "@/components/car/car-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BODY_TYPES } from "@/lib/constants";
import { useBrands } from "@/components/shared/brands-provider";

const SORTS: { label: string; compare?: (a: Car, b: Car) => number }[] = [
  { label: "Mới đăng trước" },
  { label: "Giá thấp đến cao", compare: (a, b) => a.priceTrieu - b.priceTrieu },
  { label: "Giá cao đến thấp", compare: (a, b) => b.priceTrieu - a.priceTrieu },
  { label: "Đời xe mới nhất", compare: (a, b) => b.year - a.year },
  { label: "Số km ít nhất", compare: (a, b) => (a.odoKm ?? Infinity) - (b.odoKm ?? Infinity) },
];

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: undefined, max: undefined },
  { label: "Dưới 200 triệu", min: undefined, max: 200 },
  { label: "200 - 350 triệu", min: 200, max: 350 },
  { label: "350 - 500 triệu", min: 350, max: 500 },
  { label: "Trên 500 triệu", min: 500, max: undefined },
];

export function CarListing({ cars, initialBrand }: { cars: Car[]; initialBrand?: string }) {
  const brands = useBrands();
  const [filters, setFilters] = useState<CarFilters>({ brand: initialBrand });
  const [priceIndex, setPriceIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceIndex];
    const list = applyCarFilters(cars, { ...filters, minPrice: range.min, maxPrice: range.max });
    const compare = SORTS[sortIndex].compare;
    return compare ? [...list].sort(compare) : list;
  }, [cars, filters, priceIndex, sortIndex]);

  function update<K extends keyof CarFilters>(key: K, value: CarFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const hasActiveFilters =
    filters.brand || filters.bodyType || filters.transmission || filters.q || priceIndex !== 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên xe, ví dụ: Vios, Innova..."
              className="pl-10"
              value={filters.q ?? ""}
              onChange={(e) => update("q", e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
            <Select value={filters.brand ?? "all"} onValueChange={(v) => update("brand", v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Hãng xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hãng</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.slug} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.bodyType ?? "all"}
              onValueChange={(v) => update("bodyType", v === "all" ? undefined : (v as any))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại xe</SelectItem>
                {BODY_TYPES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.transmission ?? "all"}
              onValueChange={(v) => update("transmission", v === "all" ? undefined : (v as any))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hộp số" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hộp số</SelectItem>
                <SelectItem value="Số tự động">Số tự động</SelectItem>
                <SelectItem value="Số sàn">Số sàn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(priceIndex)} onValueChange={(v) => setPriceIndex(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Mức giá" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((r, i) => (
                  <SelectItem key={r.label} value={String(i)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={() => {
              setFilters({});
              setPriceIndex(0);
            }}
            className="flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Tìm thấy <span className="font-semibold text-foreground">{filtered.length}</span> xe phù hợp
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={String(sortIndex)} onValueChange={(v) => setSortIndex(Number(v))}>
            <SelectTrigger className="h-9 w-[190px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s, i) => (
                <SelectItem key={s.label} value={String(i)}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Không tìm thấy xe phù hợp. Hãy thử điều chỉnh bộ lọc hoặc gọi hotline để được tư vấn thêm xe chưa lên web.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
