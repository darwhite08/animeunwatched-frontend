import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const RENDER_BACKEND = "https://kaiveron-backend.onrender.com"

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  // camera=(self) and microphone=(self): allow only the same origin (the Vercel app)
  // Required for WebRTC audio/video calls — empty () would block them entirely
  { key: "Permissions-Policy",      value: "camera=(self), microphone=(self), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Apple Sign In SDK + Google
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://appleid.cdn-apple.com",
      // Google Accounts CSS needed for Sign In button styling
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://cdn.myanimelist.net https://myanimelist.net https://images.unsplash.com https://img.anisearch.com https://cdn.noitatnemucod.net https://img1.ak.crunchyroll.com https://encrypted-tbn0.gstatic.com https://s4.anilist.co https://media.kitsu.app https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://avatars.githubusercontent.com https://*.r2.dev https://*.r2.cloudflarestorage.com",
      // Render backend (HTTPS for polling, wss/ws for WebSocket upgrade)
      // Removed: https://*.up.railway.app (old Railway URL, backend is now on Render)
      `connect-src 'self' http://localhost:4000 http://192.168.31.167:4000 ${RENDER_BACKEND} https://api.jikan.moe https://accounts.google.com https://sentry.io https://*.sentry.io https://*.r2.cloudflarestorage.com https://*.r2.dev wss: ws:`,
      "frame-src 'self' https://accounts.google.com https://www.youtube.com https://youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

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
      // Cloudflare R2 — user-uploaded images (post attachments, avatars).
      // Matches both pub-*.r2.dev defaults and custom CDN domains via wildcards.
      { protocol: "https", hostname: "*.r2.dev",                       pathname: "**" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com",     pathname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
  // Allow phones and tablets on the local network to access HMR/dev assets
  allowedDevOrigins: ["192.168.31.167"],
  // Fix workspace root warning from turbopack when lockfiles are present in multiple locations
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Proxy /api/v1/* and /health to the backend — this lets phones/tablets reach the
  // backend through port 3000 (Next.js) without needing direct access to port 4000.
  async rewrites() {
    const backendUrl = process.env.API_BASE ?? "http://localhost:4000";
    return [
      { source: "/api/v1/:path*",  destination: `${backendUrl}/api/v1/:path*` },
      { source: "/health",         destination: `${backendUrl}/health` },
      { source: "/sitemap.xml",    destination: `${backendUrl}/sitemap.xml` },
      // NOTE: Socket.IO WebSockets CANNOT be proxied through Next.js rewrites.
      // The socket connects directly to the backend (port 4000) from the client.
      // On LAN (phone), port 4000 must be reachable — see socket.ts for the URL logic.
    ];
  },
  // Compress responses
  compress: true,
};

// Only wrap with Sentry if DSN is configured
const hasSentryDSN = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)

export default hasSentryDSN
  ? withSentryConfig(nextConfig, {
      // Suppresses source map upload logs during build
      silent: true,
      // Widens the upload to include chunks
      widenClientFileUpload: true,
      // Routes browser requests to Sentry through Next.js to avoid ad-blockers
      tunnelRoute: "/monitoring",
      // Hides source maps from generated client bundles
      hideSourceMaps: true,
      // Automatically tree-shake Sentry logger statements
      disableLogger: true,
    })
  : nextConfig;
