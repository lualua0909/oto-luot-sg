import { Car } from "@/lib/types";
import { Calendar, Fuel, Gauge, MapPin, Palette, Settings2, Users } from "lucide-react";
import { T } from "@/components/shared/editable-text";
import { getCarColorHex } from "@/lib/constants";

export function CarSpecs({ car }: { car: Car }) {
  const colorHex = getCarColorHex(car.color);
  const specs = [
    { id: "car.specs.year", icon: Calendar, label: "Năm sản xuất", value: String(car.year) },
    { id: "car.specs.odo", icon: Gauge, label: "Số km đã đi", value: car.odoKm ? `${car.odoKm.toLocaleString("vi-VN")} km` : "Đang cập nhật" },
    { id: "car.specs.transmission", icon: Settings2, label: "Hộp số", value: car.transmission },
    { id: "car.specs.fuel", icon: Fuel, label: "Động cơ", value: car.fuel },
    { id: "car.specs.seats", icon: Users, label: "Số chỗ", value: car.seats ? `${car.seats} chỗ` : car.bodyType },
    { id: "car.specs.color", icon: Palette, label: "Màu xe", value: car.color || "Đang cập nhật" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {specs.map((s) => (
        <div key={s.label} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"><s.icon className="h-4 w-4 text-primary" /></span>
          <div>
            <p className="text-[11px] text-muted-foreground">
              <T id={s.id}>{s.label}</T>
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              {s.id === "car.specs.color" && colorHex && (
                <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: colorHex }} />
              )}
              {s.value}
            </p>
          </div>
        </div>
      ))}
      <div className="col-span-2 flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-sm transition duration-200 hover:shadow-md sm:col-span-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"><MapPin className="h-4 w-4 text-primary" /></span>
        <div>
          <p className="text-[11px] text-muted-foreground">
            <T id="car.specs.location">Địa chỉ xem xe</T>
          </p>
          <p className="text-sm font-semibold">{car.location}</p>
        </div>
      </div>
    </div>
  );
}
