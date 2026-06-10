import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Backend origins permitted by CSP connect-src. We deploy the backend on AWS
// App Runner behind the api.kaiveron.com custom domain (CNAME via Hostinger).
// Add any second backend host here if/when we ever run a hot standby.
const BACKEND_ORIGINS = [
  "https://api.kaiveron.com",
].join(" ")

const securityHeaders = [
  // HSTS — 2y + includeSubDomains + preload. Vercel adds its own too but
  // explicit beats implicit. Safe because all kaiveron domains are TLS-only.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  // COOP isolates the top-level browsing context (Spectre defense). Google
  // OAuth popup still works via FedCM (use_fedcm_for_prompt: true) which
  // doesn't rely on window.opener.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
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
      // Allow images from any HTTPS host — blog authors + trailer/anime posters
      // pull from many CDNs (MAL, catbox, imgur, etc.); images are low-risk.
      "img-src 'self' data: blob: https:",
      // Backend origins (HTTPS for polling, wss/ws for WebSocket upgrade)
      `connect-src 'self' http://localhost:4000 http://192.168.31.167:4000 ${BACKEND_ORIGINS} https://api.jikan.moe https://accounts.google.com https://sentry.io https://*.sentry.io https://*.r2.cloudflarestorage.com https://*.r2.dev wss: ws:`,
      // youtube-nocookie is what trailers/shots embed; keep youtube.com too
      "frame-src 'self' https://accounts.google.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://www.instagram.com",
      "media-src 'self' https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Force any http:// asset reference to https:// — defense in depth
      "upgrade-insecure-requests",
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
      {
        // Never cache the service worker itself — otherwise the browser keeps
        // an old worker (and its stale caching strategy) and never updates.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
  // Creator Studio is a gated subdomain for eligible creators — it is NOT part
  // of the main consumer site. Permanently (308) redirect the entire /creators
  // tree off the main domain to the studio, which enforces the access gate + SSO.
  async redirects() {
    return [
      { source: "/creators", destination: "https://creator-studio.kaiveron.com", permanent: true },
      { source: "/creators/:path*", destination: "https://creator-studio.kaiveron.com", permanent: true },
    ];
  },
  // Proxy /api/v1/* and /health to the backend — this lets phones/tablets reach the
  // backend through port 3000 (Next.js) without needing direct access to port 4000.
  async rewrites() {
    const backendUrl = process.env.API_BASE ?? "http://localhost:4000";
    const s3Origin   = process.env.NEXT_PUBLIC_S3_ORIGIN ?? "https://kaiveron-uploads.s3.us-east-1.amazonaws.com";
    return [
      { source: "/api/v1/:path*",  destination: `${backendUrl}/api/v1/:path*` },
      { source: "/health",         destination: `${backendUrl}/health` },
      { source: "/sitemap.xml",    destination: `${backendUrl}/sitemap.xml` },
      // Proxy uploaded media through kaiveron.com so privacy-focused
      // browser extensions don't block direct S3 URLs. Backend's
      // S3_PUBLIC_URL is set to https://kaiveron.com/cdn so every new
      // upload's publicUrl already points here.
      { source: "/cdn/:path*",     destination: `${s3Origin}/:path*` },
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
