import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { getCarBySlug, getCarsByBrand } from "@/lib/firebase/cars";
import { CarGallery } from "@/components/car/car-gallery";
import { CarSpecs } from "@/components/car/car-specs";
import { CarContactCard } from "@/components/car/car-contact-card";
import { CarCard } from "@/components/car/car-card";
import { Badge } from "@/components/ui/badge";
import { SITE, getCarColorHex } from "@/lib/constants";
import { formatPriceTrieu } from "@/lib/utils";
import { T } from "@/components/shared/editable-text";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const car = await getCarBySlug(params.slug).catch(() => null);
  if (!car) return {};
  return {
    title: car.title,
    description: `${car.title} — đời ${car.year}, giá ${formatPriceTrieu(car.priceTrieu)}. ${car.description.slice(0, 120)}`,
    openGraph: { images: car.coverImage ? [car.coverImage] : [] },
  };
}

export default async function CarDetailPage({ params }: { params: { slug: string } }) {
  const car = await getCarBySlug(params.slug).catch(() => null);
  if (!car) notFound();

  const related = (await getCarsByBrand(car.brand).catch(() => []))
    .filter((c) => c.id !== car.id)
    .slice(0, 4);

  const colorHex = getCarColorHex(car.color);
  const cardStyle = colorHex
    ? ({ borderColor: colorHex, borderWidth: 2, "--car-shadow": `${colorHex}55`, "--car-shadow-hover": `${colorHex}99` } as React.CSSProperties)
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: car.title,
    vehicleModelDate: String(car.year),
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    mileageFromOdometer: car.odoKm ? { "@type": "QuantitativeValue", value: car.odoKm, unitCode: "KMT" } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: car.priceTrieu * 1_000_000,
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/xe/${car.slug}`,
    },
  };

  return (
    <div className="bg-muted/30 pb-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-page pt-5 sm:pt-7">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary"><T id="breadcrumb.home">Trang chủ</T></Link>
          <span>/</span>
          <Link href="/mua-ban-o-to" className="hover:text-primary"><T id="breadcrumb.cars">Mua bán ô tô</T></Link>
          <span>/</span>
          <Link href={`/mua-ban-o-to/${car.brand}`} className="hover:text-primary">{car.brandName}</Link>
        </nav>

        <CarGallery images={car.images} title={car.title} />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_16px_-6px_var(--car-shadow,rgba(20,30,45,0.12))] hover:shadow-[0_14px_36px_-8px_var(--car-shadow-hover,rgba(20,30,45,0.25))] transition-shadow duration-300 sm:p-6" style={cardStyle}>
              <div className="flex flex-wrap items-center gap-2">
                {car.isVerified && (
                  <Badge variant="success">
                    <BadgeCheck className="h-3.5 w-3.5" /> <T id="car.detail.verified">Đã kiểm định</T>
                  </Badge>
                )}
                <Badge variant="outline">{car.bodyType}</Badge>
                <Badge variant="outline"><T id="car.detail.year">Đời</T> {car.year}</Badge>
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-snug sm:text-3xl">{car.title}</h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {car.location}</span>
                <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-primary" /> <T id="car.detail.adId">Mã tin</T>: {car.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="mt-5 border-t border-border pt-4 lg:hidden">
                <p className="text-xs text-muted-foreground"><T id="car.detail.priceLabel">Giá bán</T></p>
                <p className="font-display text-2xl font-bold text-accent">{formatPriceTrieu(car.priceTrieu)}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_16px_-6px_var(--car-shadow,rgba(20,30,45,0.12))] hover:shadow-[0_14px_36px_-8px_var(--car-shadow-hover,rgba(20,30,45,0.25))] transition-shadow duration-300 sm:p-6" style={cardStyle}>
              <h2 className="mb-4 font-display text-lg font-semibold"><T id="car.detail.specsTitle">Thông số xe</T></h2>
              <CarSpecs car={car} />
            </section>

            {car.highlights?.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_16px_-6px_var(--car-shadow,rgba(20,30,45,0.12))] hover:shadow-[0_14px_36px_-8px_var(--car-shadow-hover,rgba(20,30,45,0.25))] transition-shadow duration-300 sm:p-6" style={cardStyle}>
                <h2 className="mb-4 font-display text-lg font-semibold"><T id="car.detail.highlightsTitle">Điểm nổi bật</T></h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {car.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_16px_-6px_var(--car-shadow,rgba(20,30,45,0.12))] hover:shadow-[0_14px_36px_-8px_var(--car-shadow-hover,rgba(20,30,45,0.25))] transition-shadow duration-300 sm:p-6" style={cardStyle}>
              <h2 className="mb-4 font-display text-lg font-semibold"><T id="car.detail.descriptionTitle">Mô tả chi tiết</T></h2>
              <p className="whitespace-pre-line leading-7 text-foreground/85">{car.description || "Showroom đang cập nhật thêm thông tin chi tiết về xe này."}</p>
            </section>

            <div className="flex gap-3 rounded-xl border border-success/20 bg-success/5 p-4 text-sm leading-relaxed text-foreground/80">
              <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
              <T id="car.detail.note">Vui lòng liên hệ showroom để được tư vấn, hẹn xem xe và kiểm tra giấy tờ thực tế trước khi quyết định.</T>
            </div>
          </div>

          <aside>
            <CarContactCard car={car} />
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-10">
          <h2 className="mb-5 font-display text-xl font-bold">
            <T id="car.detail.relatedTitle">Xe cùng hãng</T> {car.brandName}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {related.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
