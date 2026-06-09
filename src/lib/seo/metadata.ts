/**
 * Shared metadata factory for listing/landing pages.
 *
 * Many high-traffic pages (genres, seasonal, trending, …) are client
 * components and therefore can't export metadata themselves. Each gets a
 * colocated server `layout.tsx` that calls `listingMetadata()` so every page
 * ships a UNIQUE <title>, description, canonical, and Open Graph block —
 * fixing the duplicate-default-title problem that makes Google collapse them.
 */
import type { Metadata } from "next"

const SITE = "https://kaiveron.com"

export function listingMetadata(opts: {
  /** Page <title> WITHOUT the " | Kaiveron" suffix (added by the root template). */
  title: string
  description: string
  /** Absolute path, e.g. "/trending". Used for canonical + OG url. */
  path: string
  /** Optional OG image path; falls back to the site default card. */
  image?: string
  keywords?: string[]
}): Metadata {
  const url = `${SITE}${opts.path}`
  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      siteName: "Kaiveron",
      title: `${opts.title} | Kaiveron`,
      description: opts.description,
      url,
      ...(opts.image ? { images: [{ url: opts.image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | Kaiveron`,
      description: opts.description,
    },
  }
}

/** Current year, resolved at build/request time for "best of {year}" copy. */
export function currentYear(): number {
  return new Date().getFullYear()
}
