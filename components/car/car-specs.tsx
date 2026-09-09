import { Car } from "@/lib/types";
import { Calendar, Fuel, Gauge, MapPin, Palette, Settings2, Users } from "lucide-react";

export function CarSpecs({ car }: { car: Car }) {
  const specs = [
    { icon: Calendar, label: "Năm sản xuất", value: String(car.year) },
    { icon: Gauge, label: "Số km đã đi", value: car.odoKm ? `${car.odoKm.toLocaleString("vi-VN")} km` : "Đang cập nhật" },
    { icon: Settings2, label: "Hộp số", value: car.transmission },
    { icon: Fuel, label: "Động cơ", value: car.fuel },
    { icon: Users, label: "Số chỗ", value: car.seats ? `${car.seats} chỗ` : car.bodyType },
    { icon: Palette, label: "Màu xe", value: car.color || "Đang cập nhật" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {specs.map((s) => (
        <div key={s.label} className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3.5">
          <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-semibold">{s.value}</p>
          </div>
        </div>
      ))}
      <div className="col-span-2 flex items-start gap-2.5 rounded-lg border border-border bg-card p-3.5 sm:col-span-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-[11px] text-muted-foreground">Địa chỉ xem xe</p>
          <p className="text-sm font-semibold">{car.location}</p>
        </div>
      </div>
    </div>
  );
}
