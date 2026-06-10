"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, Star } from "lucide-react"
import { api } from "@/lib/api/client"

/**
 * Right-rail modules for the blog reader (≥lg). Per the article-layout research,
 * the right rail is for SECONDARY, low-graphics content only (right-rail
 * blindness) — so it holds trending anime + more articles, NOT the primary
 * sign-up CTA (that lives in the sticky bottom bar + end-of-article funnel).
 */
type TrendAnime = { malId: number; title: string; titleEnglish: string | null; imageUrl: string | null; score: number | null }
type BlogCard = { slug: string; title: string; author?: { displayName?: string; username?: string } | null }

export function ReaderSidebar({ excludeSlug }: { excludeSlug?: string }) {
  const [anime, setAnime] = useState<TrendAnime[]>([])
  const [blogs, setBlogs] = useState<BlogCard[]>([])

  useEffect(() => {
    api<{ data: TrendAnime[] }>("/anime/trending?limit=6").then((r) => setAnime(r.data ?? [])).catch(() => {})
    api<{ data: BlogCard[] }>("/blogs?limit=6")
      .then((r) => setBlogs((r.data ?? []).filter((b) => b.slug !== excludeSlug).slice(0, 4)))
      .catch(() => {})
  }, [excludeSlug])

  return (
    <div className="space-y-6 text-left">
      {/* Trending anime */}
      {anime.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-subtle">
            <Flame size={12} className="text-accent-bright" /> Trending now
          </h3>
          <div className="space-y-3">
            {anime.map((a, i) => (
              <Link key={a.malId} href={`/anime/${a.malId}`} className="group flex items-center gap-3">
                <span className="w-4 shrink-0 text-center text-sm font-black text-subtle">{i + 1}</span>
                <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-black">
                  {a.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.imageUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-bold leading-snug text-muted transition-colors group-hover:text-foreground">{a.titleEnglish || a.title}</p>
                  {a.score != null && (
                    <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-amber-300"><Star size={8} className="fill-amber-300 text-amber-300" />{a.score.toFixed(1)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* More articles */}
      {blogs.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-subtle">More articles</h3>
          <div className="space-y-3">
            {blogs.map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="group block">
                <p className="line-clamp-2 text-xs font-bold leading-snug text-muted transition-colors group-hover:text-accent-bright">{b.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
