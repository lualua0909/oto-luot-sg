import Link from "next/link";
import { Car } from "@/lib/types";
import { CarCard } from "@/components/car/car-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export function CarGridSection({ cars }: { cars: Car[] }) {
  return (
    <section className="bg-secondary/40 py-14">
      <div className="container-page">
        <SectionHeading
          eyebrow="Danh sách xe"
          title="Xe đang bán"
          description="Cập nhật liên tục, xe mới về được ưu tiên hiển thị trước."
        />

        {cars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Chưa có xe nào được đăng. Vào trang quản trị (/admin) để thêm xe đầu tiên.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        <div className="mt-9 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/mua-ban-o-to">Xem tất cả xe đang bán</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
