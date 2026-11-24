import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The old test "support" page was removed: send anyone (and any search engine) who saved it to the Help Center
  async redirects() {
    return [{ source: '/support', destination: '/help', permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
      },
    ],
  },
};

export default nextConfig;
