/**
 * Renders a `<script type="application/ld+json">` block. Use for schema.org
 * structured data — boosts rich-result eligibility and (per the SEO audit)
 * is one of the strongest signals for AI engine citation.
 *
 * Server component. Use multiple instances per page if you have multiple
 * schemas — Google reads them all.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON must not be HTML-escaped — using dangerouslySetInnerHTML
      // with JSON.stringify is the documented Next.js pattern.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

const SITE = "https://kaiveron.com"

/**
 * The static site-wide schemas: Organization + WebSite (with SearchAction)
 * + WebApplication. Mount once in the root layout's <head> via JsonLd.
 */
export const SITE_JSONLD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       "Kaiveron",
    url:        SITE,
    logo:       `${SITE}/icon.svg`,
    sameAs: [
      "https://twitter.com/kaiveron",
      "https://github.com/kaiveron",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    name:       "Kaiveron",
    url:        SITE,
    potentialAction: {
      "@type":       "SearchAction",
      target:        { "@type": "EntryPoint", urlTemplate: `${SITE}/search?q={query}` },
      "query-input": "required name=query",
    },
  },
  {
    "@context":          "https://schema.org",
    "@type":             "WebApplication",
    name:                "Kaiveron",
    url:                 SITE,
    applicationCategory: "EntertainmentApplication",
    operatingSystem:     "Web",
    description:         "Free anime tracking platform with AI mood-based discovery, episode tracking, ratings, streaks, and a social community.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    // NOTE: no aggregateRating here on purpose. A self-serving, fabricated
    // rating (Kaiveron rating itself) is exactly what Google's structured-data
    // policy penalizes with a manual action, and self-reviews are ineligible
    // for star rich results anyway. Re-add ONLY once we have real, user-
    // generated ratings of Kaiveron rendered visibly on the page — and even
    // then it must point at an itemReviewed the site does not control.
  },
]
