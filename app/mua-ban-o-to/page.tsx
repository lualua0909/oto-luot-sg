import type { Metadata } from "next";
import { getPublishedCars } from "@/lib/firebase/cars";
import { CarListing } from "@/components/car/car-listing";
import { SectionHeading } from "@/components/shared/section-heading";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mua bán xe ô tô cũ TPHCM - Xe đang có",
  description:
    "Danh sách xe ô tô lướt đang bán tại Ô TÔ LƯỚT SÀI GÒN — xe kiểm tra kỹ, giấy tờ minh bạch, giá tốt.",
  alternates: { canonical: absoluteUrl("/mua-ban-o-to") },
  openGraph: { url: absoluteUrl("/mua-ban-o-to") },
};

export default async function CarListingPage() {
  const cars = await getPublishedCars(200).catch(() => []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Xe ô tô cũ đang bán tại TP.HCM",
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: car.title,
      url: absoluteUrl(`/xe/${car.slug}`),
    })),
  };

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SectionHeading
        as="h1"
        id="cars.heading"
        eyebrow="Mua bán ô tô"
        title="Xe ô tô cũ đang bán tại TP.HCM"
        description="Lọc theo hãng, loại xe, hộp số hoặc mức giá để tìm xe phù hợp nhất với bạn."
      />
      <CarListing cars={cars} />
    </div>
  );
}
