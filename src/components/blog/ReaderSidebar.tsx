"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, ArrowRight, Star } from "lucide-react"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Sticky sidebar for the blog reader (≥lg). Fills the wide empty side space with
 * a sign-up CTA (logged-out only) + trending anime + more articles, keeping the
 * conversion funnel in view the whole time a logged-out reader is scrolling.
 */
type TrendAnime = { malId: number; title: string; titleEnglish: string | null; imageUrl: string | null; score: number | null }
type BlogCard = { slug: string; title: string; author?: { displayName?: string; username?: string } | null }

export function ReaderSidebar({ excludeSlug }: { excludeSlug?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
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
      {/* Sign-up CTA — logged-out only */}
      {!isAuthenticated && (
        <div className="overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-transparent p-5">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-bright">Free forever</p>
          <h3 className="mt-1.5 text-xl font-black uppercase italic leading-none tracking-tighter text-foreground">
            Track. Rate.<br />Discover<span className="text-accent">.</span>
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">Build your watchlist, rate episodes, and join 12,000+ fans.</p>
          <Link
            href="/register"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
          >
            Get started <ArrowRight size={13} />
          </Link>
          <Link href="/login" className="mt-2 block text-center text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground">
            Log in
          </Link>
        </div>
      )}

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
