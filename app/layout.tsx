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
import { ContentProvider } from "@/components/shared/content-provider";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { getContentTexts } from "@/lib/firebase/content";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.slogan}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
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
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.slogan}`,
    description: SITE.description,
    images: ["/images/og-cover.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.slogan}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contentTexts = await getContentTexts().catch(() => ({}));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: SITE.fullName,
    alternateName: SITE.name,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${SITE.url}/images/og-cover.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Hồ Chí Minh",
      addressCountry: "VN",
    },
    geo: { "@type": "GeoCoordinates", latitude: 10.823099, longitude: 106.629664 },
    sameAs: [SITE.facebook, SITE.zalo, SITE.tiktok1, SITE.tiktok2],
  };

  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <ContentProvider initialTexts={contentTexts}>
            <ShowroomSettingsProvider>
              <BrandsProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <StickyContactBar />
                <FloatingSocialRail />
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
