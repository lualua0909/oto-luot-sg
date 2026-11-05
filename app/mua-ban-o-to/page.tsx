import type { Metadata } from "next";
import { getPublishedCars } from "@/lib/data/cars";
import { CarListing } from "@/components/car/car-listing";
import { SectionHeading } from "@/components/shared/section-heading";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { getBusinessProfile } from "@/lib/structured-data/business";
import { businessRefNode, itemListNode, webPageNode, websiteNode, ids } from "@/lib/structured-data/schema";

const PAGE_DESCRIPTION = "Danh sách xe ô tô lướt đang bán tại Ô TÔ LƯỚT SÀI GÒN — xe kiểm tra kỹ, giấy tờ minh bạch, giá tốt.";

export const metadata: Metadata = {
  title: "Mua bán xe ô tô cũ TPHCM - Xe đang có",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/mua-ban-o-to") },
  openGraph: { url: absoluteUrl("/mua-ban-o-to") },
};

export default async function CarListingPage() {
  const [cars, business] = await Promise.all([getPublishedCars(200).catch(() => []), getBusinessProfile()]);
  const listName = "Xe ô tô cũ đang bán tại TP.HCM";

  return (
    <div className="container-page py-10">
      <JsonLd
        graph={[
          websiteNode(business),
          businessRefNode(business),
          webPageNode({ path: "/mua-ban-o-to", type: "CollectionPage", name: listName, description: PAGE_DESCRIPTION, mainEntity: ids.itemList("/mua-ban-o-to") }),
          itemListNode("/mua-ban-o-to", listName, cars.map((car) => ({ name: car.title, path: `/xe/${car.slug}` }))),
        ]}
      />
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
