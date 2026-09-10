import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Fuel, Gauge, MapPin, Settings2 } from "lucide-react";
import { Car } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatPriceTrieu } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { T } from "@/components/shared/editable-text";

export function CarCard({ car }: { car: Car }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl">
      <Link href={`/xe/${car.slug}`} className="contents">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {car.coverImage ? (
            <Image
              src={car.coverImage}
              alt={car.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <T id="car.card.noImage">Chưa có ảnh</T>
            </div>
          )}
          {/* Scrim keeps the price legible over bright car photos. */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          {car.isVerified && (
            <Badge variant="success" className="absolute left-2.5 top-2.5 shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5" /> <T id="car.card.verified">Đã kiểm định</T>
            </Badge>
          )}
          <div className="absolute bottom-2.5 left-2.5 font-display text-lg font-bold leading-none text-white drop-shadow">
            {formatPriceTrieu(car.priceTrieu)}
          </div>
          <span className="absolute bottom-3 right-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <T id="car.card.year">Đời</T> {car.year}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {car.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> {car.odoKm ? `${car.odoKm.toLocaleString("vi-VN")} km` : <T id="car.card.odoUnknown">Odo đang cập nhật</T>}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" /> {car.transmission}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" /> {car.fuel}
            </span>
          </div>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{car.location}</span>
          </p>
        </div>
      </Link>

      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Link
          href={`/xe/${car.slug}`}
          className="flex-1 rounded-md border border-border px-3 py-2 text-center text-xs font-semibold text-foreground/75 transition-colors hover:border-primary/40 hover:text-primary"
        >
          <T id="car.card.detail">Xem chi tiết</T>
        </Link>
        <a
          href={`tel:${SITE.phone}`}
          className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <T id="car.card.contact">Liên hệ ngay</T>
        </a>
      </div>
    </article>
  );
}
