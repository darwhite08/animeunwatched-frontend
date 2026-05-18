import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com",          pathname: "**" },
      { protocol: "https", hostname: "cdn.myanimelist.net",           pathname: "**" },
      { protocol: "https", hostname: "myanimelist.net",               pathname: "**" },
      { protocol: "https", hostname: "img.anisearch.com",             pathname: "**" },
      { protocol: "https", hostname: "cdn.noitatnemucod.net",         pathname: "**" },
      { protocol: "https", hostname: "img1.ak.crunchyroll.com",       pathname: "**" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com",   pathname: "**" },
      { protocol: "https", hostname: "s4.anilist.co",                 pathname: "**" },
      { protocol: "https", hostname: "media.kitsu.app",               pathname: "**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com",    pathname: "**" },
      { protocol: "https", hostname: "lh4.googleusercontent.com",    pathname: "**" },
      { protocol: "https", hostname: "lh5.googleusercontent.com",    pathname: "**" },
      { protocol: "https", hostname: "lh6.googleusercontent.com",    pathname: "**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  experimental: {
    // Only import what's used from these packages — reduces bundle and compile time
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
};

export default nextConfig;
