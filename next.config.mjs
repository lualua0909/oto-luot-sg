/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve image URLs directly instead of using Next.js/Vercel Image Optimization.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
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
