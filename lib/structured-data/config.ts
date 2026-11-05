/**
 * Business facts used by the JSON-LD structured data.
 *
 * Name, description, phone, email, address and social links are edited by
 * admins in /admin/cai-dat (D1 `settings` row `showroom`) and read at request
 * time — see getBusinessProfile() in ./business.ts. This file only holds the
 * facts that have no admin field yet.
 *
 * Rule: only fill a value after checking it against an official source.
 * Empty string / null = unknown, and the property is left out of the schema.
 */
export const BUSINESS_CONFIG = {
  /** Registered company name (tên trên giấy phép kinh doanh). TODO: cần bổ sung. */
  BUSINESS_LEGAL_NAME: "",

  /** Paths under /public. */
  BUSINESS_LOGO: "/images/logo.png",
  /** Storefront photo (sign shows the name + 1060 Nguyễn Ảnh Thủ) and showroom photo used on the home page. */
  BUSINESS_IMAGES: ["/images/og-cover.jpg", "/images/about-showroom.jpg"],

  /**
   * Structured form of the showroom address shown on the site
   * ("1060 Nguyễn Ảnh Thủ, P. Trung Mỹ Tây, TP. Hồ Chí Minh").
   * Used only while the admin address still equals `source`; if an admin
   * changes the address, the schema falls back to the raw text.
   */
  BUSINESS_ADDRESS: {
    source: "1060 Nguyễn Ảnh Thủ, P. Trung Mỹ Tây, TP. Hồ Chí Minh",
    streetAddress: "1060 Nguyễn Ảnh Thủ",
    addressLocality: "Phường Trung Mỹ Tây",
    addressRegion: "Thành phố Hồ Chí Minh",
    postalCode: "", // TODO: cần bổ sung
    addressCountry: "VN",
  },

  /** GPS of the showroom. TODO: lấy từ Google Business Profile — không tự đoán. */
  BUSINESS_LATITUDE: null as number | null,
  BUSINESS_LONGITUDE: null as number | null,

  /**
   * Opening hours as shown on /lien-he (CMS text id `contact.hours`).
   * If an admin edits that text so it no longer equals `displayText`,
   * opening hours are dropped from the schema until this entry is updated.
   */
  BUSINESS_OPENING_HOURS: {
    contentTextId: "contact.hours",
    displayText: "7:30 - 19:00, tất cả các ngày trong tuần",
    specification: [
      {
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:30",
        closes: "19:00",
      },
    ],
  },

  /** The site states it serves TP.HCM (service pages, titles, about text). */
  BUSINESS_AREA_SERVED: { "@type": "City", name: "Thành phố Hồ Chí Minh" },

  /** Leave empty: no verified price range. */
  BUSINESS_PRICE_RANGE: "",

  LANGUAGE: "vi-VN",
} as const;
