import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AnimeUnwatched — Neural Archive",
    short_name: "Unwatched",
    description: "Track, rate, and discover anime that deserves more hype. AI-powered recommendations.",
    start_url: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#4f46e5",
    orientation: "portrait",
    icons: [
      { src: "/favicon.ico",    sizes: "any",     type: "image/x-icon" },
      { src: "/icon-192.png",   sizes: "192x192", type: "image/png"    },
      { src: "/icon-512.png",   sizes: "512x512", type: "image/png"    },
    ],
    categories: ["entertainment", "social", "anime"],
    screenshots: [],
  }
}
