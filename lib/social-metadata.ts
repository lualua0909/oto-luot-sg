import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import { R2_PUBLIC_URL } from "@/lib/images/url";
import { absoluteUrl } from "@/lib/seo";

/** Each page needs a complete OG object: Next replaces nested layout metadata. */
export function socialMetadata(title: string, description: string, path: string, type: "website" | "article" = "website"): Pick<Metadata, "openGraph" | "twitter"> {
  // Legacy car objects can contain WebP bytes under .jpg names. Use a verified
  // JPEG for social cards instead of inferring a MIME type from those filenames.
  const imageUrl = `${R2_PUBLIC_URL}/branding/social-preview.jpg`;
  return {
    openGraph: {
      title, description, url: absoluteUrl(path), type, siteName: SITE.name, locale: "vi_VN",
      images: [{ url: imageUrl, secureUrl: imageUrl, type: "image/jpeg", alt: "Showroom Ô Tô Lướt Sài Gòn", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}
