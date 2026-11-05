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
import { getCachedContentTexts } from "@/lib/structured-data/business";
import { Analytics } from "@vercel/analytics/next";
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

// Never cache CMS data: every request queries D1 directly.
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
  // JSON-LD is rendered per page (components/seo/json-ld.tsx), not here,
  // so 404 and /admin pages carry no structured data.
  const contentTexts = await getCachedContentTexts();

  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <head
        dangerouslySetInnerHTML={{
          __html: `<!-- Author: NAD -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;500;600;700&display=swap">`,
        }}
      />
      <body className="flex min-h-screen flex-col font-sans">
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
      </body>
    </html>
  );
}
