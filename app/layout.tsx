import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyContactBar } from "@/components/shared/sticky-contact-bar";
import { FloatingSocialRail } from "@/components/shared/floating-social-rail";
import { Toaster } from "sonner";
import { ShowroomSettingsProvider } from "@/components/shared/showroom-settings-provider";
import { BrandsProvider } from "@/components/shared/brands-provider";
import { MotionProvider } from "@/components/shared/motion-provider";
import { ContentProvider } from "@/components/shared/content-provider";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { getContentTexts } from "@/lib/firebase/content";
import { getShowroomSettings } from "@/lib/firebase/settings";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteUrl } from "@/lib/seo";

const display = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Never cache CMS/Firestore data: every request queries directly.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE.name} | ${SITE.slogan}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  keywords: [
    "ô tô lướt sài gòn",
    "ô tô cũ giá rẻ",
    "mua bán ô tô cũ tphcm",
    "showroom ô tô lướt tp.hcm",
    "ô tô cũ trả góp",
  ],
  authors: [{ name: SITE.fullName }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: getSiteUrl(),
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.slogan}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.slogan}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION] } }
      : {}),
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contentTexts = await getContentTexts().catch(() => ({}));
  const showroomSettings = await getShowroomSettings().catch(() => null);
  const site = showroomSettings ?? SITE;
  const siteUrl = getSiteUrl();
  const sameAs = [site.facebook, site.zalo, site.tiktok1, site.tiktok2, site.googleBusinessUrl].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteUrl}/#showroom`,
    name: site.fullName,
    alternateName: site.name,
    url: siteUrl,
    telephone: site.phone,
    ...(site.taxCode ? { taxID: site.taxCode } : {}),
    ...(site.email ? { email: site.email } : {}),
    image: `${siteUrl}/images/og-cover.jpg`,
    logo: `${siteUrl}/images/logo.png`,
    priceRange: "₫₫",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Hồ Chí Minh",
      addressCountry: "VN",
    },
    areaServed: { "@type": "City", name: "Thành phố Hồ Chí Minh" },
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "07:30",
      closes: "19:00",
    }],
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <ContentProvider initialTexts={contentTexts}>
            <ShowroomSettingsProvider>
              <BrandsProvider>
                <MotionProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <StickyContactBar />
                  <FloatingSocialRail />
                </MotionProvider>
              </BrandsProvider>
            </ShowroomSettingsProvider>
          </ContentProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
