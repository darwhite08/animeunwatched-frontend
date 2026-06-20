/**
 * Server-rendered anime grid for SEO landing pages.
 *
 * Intentionally a plain Server Component (no "use client", no framer-motion,
 * no modal). Every card is a real <a> to /anime/[id] with a poster <img> and
 * alt text, so the full ranked list ships in the initial HTML — exactly what
 * Googlebot and AI crawlers index. Interactivity lives on the detail page.
 */
import Link from "next/link"
import type { SeoAnime } from "@/lib/seo/server-fetch"

export function SeoAnimeGrid({ items }: { items: SeoAnime[] }) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((a, i) => {
        const title = a.titleEnglish ?? a.title
        return (
          <li key={a.malId} className="list-none">
            <Link
              href={`/anime/${a.malId}`}
              className="group block overflow-hidden rounded-xl border border-border bg-white/[0.02] transition hover:border-accent/40"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-white/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.imageUrl ?? "/assets/png/tanjiro.png"}
                  alt={`${title} anime poster`}
                  loading={i < 5 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-accent-bright">
                  #{i + 1}
                </span>
                {a.score != null && (
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-accent-bright">
                    ★ {a.score.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="p-2">
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-accent-bright">
                  {title}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {[a.type, a.year, a.episodes ? `${a.episodes} eps` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
