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
      // AI crawlers — explicit allow. Required to be cited by ChatGPT /
      // Perplexity / Gemini / Claude / Google AI Overviews. Blocking any
      // of these makes Kaiveron invisible inside the corresponding AI
      // answer engine. SEO spec §3.3 + §7A.
      { userAgent: "GPTBot",            allow: "/" }, // OpenAI training crawler
      { userAgent: "OAI-SearchBot",     allow: "/" }, // ChatGPT live search
      { userAgent: "ChatGPT-User",      allow: "/" }, // ChatGPT on-demand fetch
      { userAgent: "PerplexityBot",     allow: "/" },
      { userAgent: "ClaudeBot",         allow: "/" }, // Anthropic
      { userAgent: "Claude-Web",        allow: "/" },
      { userAgent: "anthropic-ai",      allow: "/" },
      { userAgent: "Google-Extended",   allow: "/" }, // Gemini / AI Overviews
      { userAgent: "Applebot-Extended", allow: "/" }, // Apple Intelligence
      { userAgent: "Bingbot",           allow: "/" }, // Bing index = ChatGPT search source
      { userAgent: "Amazonbot",         allow: "/" },
      { userAgent: "DuckAssistBot",     allow: "/" },
      { userAgent: "Bytespider",        allow: "/" }, // ByteDance / Doubao
      { userAgent: "CCBot",             allow: "/" }, // Common Crawl (training corpora)
    ],
    sitemap: "https://kaiveron.com/sitemap.xml",
    host: "https://kaiveron.com",
  }
}
