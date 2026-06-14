"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, Clock, Star, ArrowRight } from "lucide-react"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Conversion funnel shown at the foot of public reading pages (blog posts).
 *
 * Logged-out visitors (SEO/search traffic) get always-on engaging content —
 * trending anime + more articles — plus a prominent sign-up CTA. Logged-in
 * readers see the trending content without the CTA.
 */
type TrendAnime = {
  malId: number
  title: string
  titleEnglish: string | null
  imageUrl: string | null
  score: number | null
  year: number | null
  type: string | null
}
type BlogCard = {
  slug: string
  title: string
  publishedAt: string | null
  author?: { displayName?: string; username?: string } | null
}

export function ReaderFunnel({ excludeSlug }: { excludeSlug?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [anime, setAnime] = useState<TrendAnime[]>([])
  const [blogs, setBlogs] = useState<BlogCard[]>([])

  useEffect(() => {
    api<{ data: TrendAnime[] }>("/anime/trending?limit=8")
      .then((r) => setAnime(r.data ?? []))
      .catch(() => {})
    api<{ data: BlogCard[] }>("/blogs?limit=6")
      .then((r) => setBlogs((r.data ?? []).filter((b) => b.slug !== excludeSlug).slice(0, 4)))
      .catch(() => {})
  }, [excludeSlug])

  return (
    <section className="space-y-12 pt-4" aria-label="Discover more on Kaiveron">
      {/* Trending anime — always populated, keeps readers exploring */}
      {anime.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
            <Flame size={13} className="text-accent-bright" /> Trending on Kaiveron
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {anime.map((a) => (
              <Link key={a.malId} href={`/anime/${a.malId}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface-2">
                  {a.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.imageUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-black" />
                  )}
                  {a.score != null && (
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                      <Star size={9} className="fill-amber-300 text-amber-300" />{a.score.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-snug text-muted transition-colors group-hover:text-foreground">
                  {a.titleEnglish || a.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sign-up funnel — logged-out only */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-accent/[0.04] to-transparent p-8 text-center sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-bright">Join the Dojo · Free forever</p>
          <h3 className="mt-3 text-3xl font-black uppercase italic tracking-tighter text-foreground sm:text-4xl">
            Track. Rate.<br className="sm:hidden" /> Discover<span className="text-accent">.</span>
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Build your watchlist, rate every episode, climb the leaderboard, and join 12,000+ fans discussing anime — with AI-powered discovery made for exactly how you think.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-[11px] font-black uppercase tracking-widest text-black transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
            >
              Get started — it&apos;s free <ArrowRight size={14} />
            </Link>
            <Link href="/login" className="rounded-full border border-border px-7 py-3 text-[11px] font-black uppercase tracking-widest text-muted transition-colors hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      )}

      {/* More articles — real, not mock */}
      {blogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">More from The Chronicle</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {blogs.map((b) => (
              <Link
                key={b.slug}
                href={`/blog/${b.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-surface-2 p-5 transition-all hover:border-white/30"
              >
                <p className="line-clamp-2 text-sm font-black uppercase italic leading-snug tracking-tight text-foreground transition-colors group-hover:text-white">
                  {b.title}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-subtle">
                  <Clock size={9} /> by {b.author?.displayName || b.author?.username || "Kaiveron"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
