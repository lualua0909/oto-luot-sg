import type { Metadata } from "next";
import { getPublishedCars } from "@/lib/firebase/cars";
import { CarListing } from "@/components/car/car-listing";
import { SectionHeading } from "@/components/shared/section-heading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mua bán ô tô cũ",
  description:
    "Danh sách xe ô tô lướt đang bán tại Ô TÔ LƯỚT SÀI GÒN — xe kiểm tra kỹ, giấy tờ minh bạch, giá tốt.",
};

export default async function CarListingPage() {
  const cars = await getPublishedCars(200).catch(() => []);

  return (
    <div className="container-page py-10">
      <SectionHeading
        id="cars.heading"
        eyebrow="Mua bán ô tô"
        title="Tất cả xe đang bán"
        description="Lọc theo hãng, loại xe, hộp số hoặc mức giá để tìm xe phù hợp nhất với bạn."
      />
      <CarListing cars={cars} />
    </div>
  );
}
