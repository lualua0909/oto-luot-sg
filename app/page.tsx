import { Hero } from "@/components/home/hero";
import { BrandGrid } from "@/components/home/brand-grid";
import { CarGridSection } from "@/components/home/car-grid-section";
import { LeadForm } from "@/components/home/lead-form";
import { AboutSection } from "@/components/home/about-section";
import { NewsSection } from "@/components/home/news-section";
import { TrustProcessSection } from "@/components/home/trust-process-section";
import { RecentlyViewedSection } from "@/components/car/recently-viewed";
import { LoanCalculator } from "@/components/finance/loan-calculator";
import { getFeaturedCars } from "@/lib/data/cars";
import { getPublishedNews } from "@/lib/data/news";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { getBusinessProfile } from "@/lib/structured-data/business";
import { businessNode, webPageNode, websiteNode } from "@/lib/structured-data/schema";

const PAGE_TITLE = "Ô Tô Lướt Sài Gòn | Xe Cũ TPHCM Đang Bán";
const PAGE_DESCRIPTION = "Xe ô tô lướt, xe cũ có sẵn tại TP.HCM. Xem xe thực tế, đối chiếu giấy tờ, hỗ trợ kiểm tra, sang tên, thu mua và trả góp.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { url: absoluteUrl("/") },
};

export default async function HomePage() {
  const [cars, news, business] = await Promise.all([
    getFeaturedCars(12).catch(() => []),
    getPublishedNews(4).catch(() => []),
    getBusinessProfile(),
  ]);

  return (
    <>
      <JsonLd
        graph={[
          websiteNode(business),
          businessNode(business),
          webPageNode({ path: "/", name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
        ]}
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
