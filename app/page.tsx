import { Hero } from "@/components/home/hero";
import { BrandGrid } from "@/components/home/brand-grid";
import { CarGridSection } from "@/components/home/car-grid-section";
import { LeadForm } from "@/components/home/lead-form";
import { AboutSection } from "@/components/home/about-section";
import { NewsSection } from "@/components/home/news-section";
import { TrustProcessSection } from "@/components/home/trust-process-section";
import { RecentlyViewedSection } from "@/components/car/recently-viewed";
import { LoanCalculator } from "@/components/finance/loan-calculator";
import { getFeaturedCars } from "@/lib/firebase/cars";
import { getPublishedNews } from "@/lib/firebase/news";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ô Tô Lướt Sài Gòn | Xe Cũ TPHCM Đang Bán",
  description: "Xe ô tô lướt, xe cũ có sẵn tại TP.HCM. Xem xe thực tế, đối chiếu giấy tờ, hỗ trợ kiểm tra, sang tên, thu mua và trả góp.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { url: absoluteUrl("/") },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${absoluteUrl("/")}/#website`,
  name: "Ô TÔ LƯỚT SÀI GÒN",
  alternateName: ["Oto Luot Sai Gon", "otoluotsaigon.com"],
  url: absoluteUrl("/"),
};

export default async function HomePage() {
  const [cars, news] = await Promise.all([
    getFeaturedCars(12).catch(() => []),
    getPublishedNews(4).catch(() => []),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Hero />
      <BrandGrid />
      <RecentlyViewedSection />
      <CarGridSection cars={cars} />
      <TrustProcessSection />
      <LoanCalculator />
      <LeadForm />
      <AboutSection />
      <NewsSection posts={news} />
    </>
  );
}
