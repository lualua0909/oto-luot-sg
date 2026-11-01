/**
 * JSON-LD builders. Every page renders ONE <script type="application/ld+json">
 * containing an @graph (see components/seo/json-ld.tsx). Entities are linked
 * by stable @id values so Google sees one business, one website, and one
 * WebPage per URL.
 */
import { absoluteUrl, cleanSeoText, compactDescription } from "@/lib/seo";
import type { Car, NewsPost } from "@/lib/types";
import type { BusinessProfile } from "./business";
import { BUSINESS_CONFIG } from "./config";

export type JsonLdNode = Record<string, unknown>;

const C = BUSINESS_CONFIG;

/** Base for fragment ids: the home page gets a trailing slash ("…com/#webpage"). */
const idBase = (path: string) => (path === "/" ? `${absoluteUrl("/")}/` : absoluteUrl(path));

export const ids = {
  business: () => `${idBase("/")}#business`,
  website: () => `${idBase("/")}#website`,
  logo: () => `${idBase("/")}#logo`,
  webPage: (path: string) => `${idBase(path)}#webpage`,
  breadcrumb: (path: string) => `${idBase(path)}#breadcrumb`,
  primaryImage: (path: string) => `${idBase(path)}#primaryimage`,
  vehicle: (path: string) => `${idBase(path)}#vehicle`,
  article: (path: string) => `${idBase(path)}#article`,
  service: (path: string) => `${idBase(path)}#service`,
  itemList: (path: string) => `${idBase(path)}#itemlist`,
};

/** Drops decorative emoji from CMS titles (same cleanup as the <title> tag). */
const text = (value: string) => cleanSeoText(value) || value;

/** Makes /images/... absolute; leaves full URLs alone; drops empties. */
export function toAbsoluteUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return absoluteUrl(url);
  return undefined;
}

/** Removes undefined / null / "" / [] so we never emit empty properties. */
function clean<T extends JsonLdNode>(node: T): T {
  return Object.fromEntries(
    Object.entries(node).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
  ) as T;
}

const ref = (id: string) => ({ "@id": id });

// ---------------------------------------------------------------- Business

function postalAddress(address: string): JsonLdNode {
  const a = C.BUSINESS_ADDRESS;
  const sameAsConfig = address.normalize("NFC").replace(/\s+/g, " ").trim() === a.source.normalize("NFC");
  if (sameAsConfig) {
    return clean({
      "@type": "PostalAddress",
      streetAddress: a.streetAddress,
      addressLocality: a.addressLocality,
      addressRegion: a.addressRegion,
      postalCode: a.postalCode,
      addressCountry: a.addressCountry,
    });
  }
  // Admin changed the address: publish it verbatim rather than guessing its parts.
  return { "@type": "PostalAddress", streetAddress: address, addressCountry: "VN" };
}

function logoNode(): JsonLdNode {
  return { "@type": "ImageObject", "@id": ids.logo(), url: absoluteUrl(C.BUSINESS_LOGO), contentUrl: absoluteUrl(C.BUSINESS_LOGO) };
}

/**
 * Full business entity: AutoDealer (a LocalBusiness and an Organization), so
 * the Organization fields (logo, sameAs, contactPoint) live on the same node.
 * Rendered on the home, about and contact pages.
 */
export function businessNode(b: BusinessProfile): JsonLdNode {
  const hasGeo = C.BUSINESS_LATITUDE != null && C.BUSINESS_LONGITUDE != null;
  return clean({
    "@type": "AutoDealer",
    "@id": ids.business(),
    name: b.name,
    legalName: C.BUSINESS_LEGAL_NAME,
    url: absoluteUrl("/"),
    logo: logoNode(),
    image: C.BUSINESS_IMAGES.map((path) => absoluteUrl(path)),
    description: b.description,
    telephone: b.phones[0],
    email: b.email,
    taxID: b.taxId,
    address: b.address ? postalAddress(b.address) : undefined,
    geo: hasGeo ? { "@type": "GeoCoordinates", latitude: C.BUSINESS_LATITUDE, longitude: C.BUSINESS_LONGITUDE } : undefined,
    hasMap: b.mapUrl,
    openingHoursSpecification: b.openingHours?.map((h) => ({ "@type": "OpeningHoursSpecification", ...h })),
    priceRange: C.BUSINESS_PRICE_RANGE,
    areaServed: C.BUSINESS_AREA_SERVED,
    contactPoint: b.phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    })),
    sameAs: b.sameAs,
  });
}

/** Short node for pages that only need to point at the business (publisher, provider, seller). */
export function businessRefNode(b: BusinessProfile): JsonLdNode {
  return { "@type": "AutoDealer", "@id": ids.business(), name: b.name, url: absoluteUrl("/"), logo: logoNode() };
}

// ---------------------------------------------------------------- WebSite

export function websiteNode(b: BusinessProfile): JsonLdNode {
  // No SearchAction: the site has no URL-addressable search results page.
  return {
    "@type": "WebSite",
    "@id": ids.website(),
    name: b.name,
    alternateName: ["Ô Tô Lướt Sài Gòn", "otoluotsaigon.com"],
    url: absoluteUrl("/"),
    publisher: ref(ids.business()),
    inLanguage: C.LANGUAGE,
  };
}

// ---------------------------------------------------------------- WebPage

export type Crumb = { name: string; path: string };

export function breadcrumbNode(path: string, crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": ids.breadcrumb(path),
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: text(c.name),
      item: absoluteUrl(c.path),
    })),
  };
}

export interface WebPageInput {
  path: string;
  name: string;
  description?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";
  /** Image actually shown on the page. */
  image?: string;
  /** What the page is about; defaults to the business. Pass null to omit. */
  about?: string | null;
  mainEntity?: string;
  hasBreadcrumb?: boolean;
  datePublished?: number;
  dateModified?: number;
}

export function webPageNode(p: WebPageInput): JsonLdNode {
  const image = toAbsoluteUrl(p.image);
  return clean({
    "@type": p.type ?? "WebPage",
    "@id": ids.webPage(p.path),
    url: absoluteUrl(p.path),
    name: text(p.name),
    description: p.description ? compactDescription(p.description, 300) : undefined,
    isPartOf: ref(ids.website()),
    about: p.about === null ? undefined : ref(p.about ?? ids.business()),
    mainEntity: p.mainEntity ? ref(p.mainEntity) : undefined,
    primaryImageOfPage: image ? { "@type": "ImageObject", "@id": ids.primaryImage(p.path), url: image, contentUrl: image } : undefined,
    breadcrumb: p.hasBreadcrumb ? ref(ids.breadcrumb(p.path)) : undefined,
    datePublished: p.datePublished ? new Date(p.datePublished).toISOString() : undefined,
    dateModified: p.dateModified ? new Date(p.dateModified).toISOString() : undefined,
    inLanguage: C.LANGUAGE,
  });
}

export function itemListNode(path: string, name: string, items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": ids.itemList(path),
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: text(item.name),
      url: absoluteUrl(item.path),
    })),
  };
}

// ---------------------------------------------------------------- Service

export function serviceNode(input: { path: string; name: string; description: string; serviceType: string }): JsonLdNode {
  return {
    "@type": "Service",
    "@id": ids.service(input.path),
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url: absoluteUrl(input.path),
    provider: ref(ids.business()),
    areaServed: C.BUSINESS_AREA_SERVED,
  };
}

// ---------------------------------------------------------------- Article

export function blogPostingNode(post: NewsPost, path: string, b: BusinessProfile): JsonLdNode {
  const image = toAbsoluteUrl(post.coverImage);
  // No individual author is stored; the page credits the showroom team.
  const org = { "@type": "Organization", "@id": ids.business(), name: b.name, url: absoluteUrl("/") };
  return clean({
    "@type": "BlogPosting",
    "@id": ids.article(path),
    headline: text(post.title).slice(0, 110),
    description: post.excerpt,
    image: image ? [image] : undefined,
    datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: org,
    publisher: ref(ids.business()),
    mainEntityOfPage: ref(ids.webPage(path)),
    isPartOf: ref(ids.webPage(path)),
    inLanguage: C.LANGUAGE,
  });
}

// ---------------------------------------------------------------- Car

/** Only cars that are still on sale get a Car + Offer node. */
export function isCarOnSale(car: Car) {
  return car.status === "dang-ban" || car.status === "dang-coc";
}

/**
 * Car (a schema.org Product subtype) + Offer, using only the facts printed on
 * the detail page: title, brand (breadcrumb), "Năm sản xuất", ODO, transmission,
 * fuel, seats, colour, body type, price, photos, description.
 */
export function carNode(car: Car, path: string): JsonLdNode {
  const url = absoluteUrl(path);
  const images = (car.images ?? []).map((i) => toAbsoluteUrl(i.url)).filter(Boolean) as string[];
  const cover = toAbsoluteUrl(car.coverImage);
  return clean({
    "@type": "Car",
    "@id": ids.vehicle(path),
    name: text(car.title),
    description: car.description ? compactDescription(car.description, 500) : undefined,
    url,
    image: images.length ? images : cover ? [cover] : undefined,
    brand: car.brandName ? { "@type": "Brand", name: car.brandName } : undefined,
    productionDate: car.year ? String(car.year) : undefined,
    bodyType: car.bodyType,
    color: car.color,
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    vehicleSeatingCapacity: car.seats || undefined,
    mileageFromOdometer: car.odoKm ? { "@type": "QuantitativeValue", value: car.odoKm, unitCode: "KMT" } : undefined,
    itemCondition: "https://schema.org/UsedCondition",
    offers: car.priceTrieu > 0
      ? {
          "@type": "Offer",
          url,
          price: Math.round(car.priceTrieu * 1_000_000),
          priceCurrency: "VND",
          itemCondition: "https://schema.org/UsedCondition",
          availability: car.status === "dang-coc" ? "https://schema.org/Reserved" : "https://schema.org/InStock",
          seller: ref(ids.business()),
        }
      : undefined,
  });
}
