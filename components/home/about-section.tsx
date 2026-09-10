import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { T } from "@/components/shared/editable-text";

export function AboutSection() {
  return (
    <section className="container-page grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2">
      <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl shadow-card md:order-1">
        <Image src="/images/about-showroom.jpg" alt="Showroom Ô TÔ LƯỚT SÀI GÒN" fill sizes="50vw" className="object-cover" />
      </div>

      <div className="order-1 md:order-2">
        <p className="mb-2 text-sm font-semibold text-accent">
          <T id="home.about.eyebrow">Về chúng tôi</T>
        </p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          <T id="home.about.title">Ô TÔ LƯỚT SÀI GÒN — cầu nối tin cậy giữa người mua và người bán</T>
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          <T id="home.about.paragraph1a">Mua bán ô tô cũ uy tín không phải là điều dễ dàng. Nắm bắt được nhu cầu đó,</T>{" "}
          {SITE.fullName}{" "}
          <T id="home.about.paragraph1b">ra đời với mục tiêu trở thành cầu nối tin cậy giữa người mua và người bán xe.</T>
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          <T id="home.about.paragraph2">Với định hướng phát triển lâu dài, chúng tôi không ngừng nâng cao chất lượng dịch vụ, mang đến trải nghiệm mua bán xe chuyên nghiệp, minh bạch và an toàn.</T>
        </p>

        <div className="mt-5 flex items-center gap-2.5 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span>{SITE.address}</span>
        </div>
        <div className="mt-2 flex items-center gap-2.5 text-sm">
          <Phone className="h-4 w-4 shrink-0 text-primary" />
          <span>
            <T id="home.about.hotlineLabel">Hotline / Zalo</T>: {SITE.phoneDisplay}
          </span>
        </div>

        <Button asChild size="lg" className="mt-6">
          <Link href="/gioi-thieu">
            <T id="home.about.cta">Tìm hiểu thêm</T>
          </Link>
        </Button>
      </div>
    </section>
  );
}
