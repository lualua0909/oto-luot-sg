"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";
import { T } from "@/components/shared/editable-text";

export function AboutSection() {
  const site = useShowroomSettings();
  return (
    <section className="container-page grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2">
      <div data-reveal="left" className="group fx-shine relative order-2 aspect-[4/3] overflow-hidden rounded-2xl shadow-card transition-shadow duration-500 hover:shadow-2xl md:order-1">
        <div data-parallax="0.12" className="absolute inset-x-0 -inset-y-[8%]">
          <Image src="/images/about-showroom.jpg" alt="Showroom Ô TÔ LƯỚT SÀI GÒN" fill sizes="50vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 transition-all duration-500 group-hover:ring-4 group-hover:ring-accent/40" />
      </div>

      <div data-reveal-stagger className="order-1 md:order-2">
        <p className="mb-2 text-sm font-semibold text-accent">
          <T id="home.about.eyebrow">Về chúng tôi</T>
        </p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          <T id="home.about.title">Ô TÔ LƯỚT SÀI GÒN — cầu nối tin cậy giữa người mua và người bán</T>
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          <T id="home.about.paragraph1a">Mua bán ô tô cũ uy tín không phải là điều dễ dàng. Nắm bắt được nhu cầu đó,</T>{" "}
          {site.fullName}{" "}
          <T id="home.about.paragraph1b">ra đời với mục tiêu trở thành cầu nối tin cậy giữa người mua và người bán xe.</T>
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          <T id="home.about.paragraph2">Với định hướng phát triển lâu dài, chúng tôi không ngừng nâng cao chất lượng dịch vụ, mang đến trải nghiệm mua bán xe chuyên nghiệp, minh bạch và an toàn.</T>
        </p>

        <div className="group mt-5 flex items-center gap-2.5 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-accent" />
          <span>{site.address}</span>
        </div>
        <div className="group mt-2 flex items-center gap-2.5 text-sm">
          <Phone className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:text-accent" />
          <span>
            <T id="home.about.hotlineLabel">Hotline / Zalo</T>: {site.phoneDisplay}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" data-magnetic className="fx-shine"><Link href="/gioi-thieu"><T id="home.about.cta">Tìm hiểu thêm</T></Link></Button>
          {site.googleBusinessUrl && <Button asChild size="lg" variant="outline"><a href={site.googleBusinessUrl} target="_blank" rel="noopener noreferrer"><Star className="h-4 w-4" /> Xem trên Google</a></Button>}
        </div>
      </div>
    </section>
  );
}
