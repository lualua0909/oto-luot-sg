const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").trim().replace(/\/+$/, "");
if (!R2_PUBLIC_URL && process.env.VERCEL) {
  throw new Error("Thiếu NEXT_PUBLIC_R2_PUBLIC_URL: ảnh phải tải thẳng từ domain public của R2.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return R2_PUBLIC_URL ? [
      { source: "/opengraph-image", destination: `${R2_PUBLIC_URL}/branding/social-preview.jpg`, permanent: true },
    ] : [];
  },
  images: {
    // Images load straight from the public R2 domain; no Next.js/Vercel optimizer.
    unoptimized: true,
    remotePatterns: [
      ...(R2_PUBLIC_URL ? [{ protocol: "https", hostname: new URL(R2_PUBLIC_URL).hostname }] : []),
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
