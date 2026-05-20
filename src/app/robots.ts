import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private/auth-gated routes — no indexing value, prevents crawl budget waste
        disallow: [
          "/api/",
          "/user/",          // slug-based private dashboard routes
          "/me/",            // settings routes
          "/admin/",         // admin panel
          "/chat/",          // DMs are private
          "/notifications/", // private
          "/watchlist/",     // private by default
          "/feed/",          // auth-gated feed
          "/dashboard/",     // legacy catch-all
          "/creator/",       // creator tools
        ],
      },
      // Allow Googlebot to see community content (it's public)
      {
        userAgent: "Googlebot",
        allow: ["/community/", "/clubs/", "/anime/", "/blogs/", "/reviews/"],
      },
    ],
    sitemap: "https://kaiveron.app/sitemap.xml",
  }
}
