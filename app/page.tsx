import { Hero } from "@/components/home/hero";
import { BrandGrid } from "@/components/home/brand-grid";
import { CarGridSection } from "@/components/home/car-grid-section";
import { LeadForm } from "@/components/home/lead-form";
import { AboutSection } from "@/components/home/about-section";
import { NewsSection } from "@/components/home/news-section";
import { getFeaturedCars } from "@/lib/firebase/cars";
import { getPublishedNews } from "@/lib/firebase/news";

export const revalidate = 60;

export default async function HomePage() {
  const [cars, news] = await Promise.all([
    getFeaturedCars(12).catch(() => []),
    getPublishedNews(4).catch(() => []),
  ]);

  return (
    <>
      <Hero />
      <BrandGrid />
      <CarGridSection cars={cars} />
      <LeadForm />
      <AboutSection />
      <NewsSection posts={news} />
    </>
  );
}
