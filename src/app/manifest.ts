import type { MetadataRoute } from "next"

// Web App Manifest via the App Router Metadata API (emitted at
// /manifest.webmanifest and auto-linked from <head> by Next).
//
// Colors come from the real theme in globals.css: `--app-bg` is #020202 (the
// :root default that paints before ThemeProvider applies a theme class, so the
// install splash matches the first frame). The app has six swappable accent
// themes, so theme_color stays on the neutral dark base rather than any one
// accent (previously it was the amber accent #f59e0b — switch back if a branded
// status bar is preferred).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaiveron — Neural Anime Archive",
    short_name: "Kaiveron",
    description:
      "Track, rate, and discover anime that deserves more hype. AI-powered recommendations.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020202",
    theme_color: "#020202",
    categories: ["entertainment", "social", "anime"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        // Maskable: Android crops to its adaptive shape (circle/squircle), so the
        // logo must sit inside the central ~80% "safe zone" to avoid clipping.
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
