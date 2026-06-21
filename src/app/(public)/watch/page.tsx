"use client"

import Link from "next/link"
import { Play, Info, ChevronRight, Tv } from "lucide-react"
import { useBrowseAnime, useSeasonal } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

/* Current season for the "New This Season" row. */
function currentSeason(): { year: number; season: string } {
  const d = new Date()
  const m = d.getMonth() // 0-11
  const season = m <= 2 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "fall"
  return { year: d.getFullYear(), season }
}

function PosterCard({ a }: { a: AnimeDTO }) {
  const title = a.titleEnglish || a.title
  return (
    <Link href={`/anime/${a.malId}/watch`} className="group relative w-[118px] shrink-0 sm:w-[150px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface">
        {a.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={a.imageUrl} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-black shadow-lg">
            <Play size={18} className="ml-0.5" fill="currentColor" />
          </span>
        </div>
        {a.score ? (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-accent-bright backdrop-blur">★ {a.score.toFixed(1)}</span>
        ) : null}
      </div>
      <p className="mt-1.5 line-clamp-1 text-[11px] font-bold text-muted transition group-hover:text-foreground">{title}</p>
    </Link>
  )
}

function Row({ title, items, loading }: { title: string; items: AnimeDTO[]; loading?: boolean }) {
  if (!loading && items.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-black uppercase italic tracking-tight text-foreground">{title}</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 pb-1">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[2/3] w-[118px] shrink-0 animate-pulse rounded-lg bg-surface sm:w-[150px]" />)
          : items.map(a => <PosterCard key={a.malId} a={a} />)}
      </div>
    </section>
  )
}

export default function WatchHubPage() {
  const { year, season } = currentSeason()
  const trending = useBrowseAnime({ limit: 24 })
  const seasonal = useSeasonal(year, season)
  const tv = useBrowseAnime({ type: "TV", limit: 24 })
  const movies = useBrowseAnime({ type: "Movie", limit: 24 })

  const trendingList = trending.data?.data ?? []
  const featured = trendingList[0]
  const featuredTitle = featured ? (featured.titleEnglish || featured.title) : ""

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-24">

        {/* Hero — featured title */}
        {featured && (
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-border">
            <div className="relative h-[44vh] min-h-[280px] w-full">
              {featured.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={featured.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 max-w-lg p-6 sm:p-8">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright"><Tv size={12} /> Featured</p>
                <h1 className="text-2xl font-black uppercase italic leading-none tracking-tighter sm:text-4xl">{featuredTitle}</h1>
                <p className="mt-2 line-clamp-2 text-xs text-muted sm:text-sm">{featured.synopsis}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/anime/${featured.malId}/watch`} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[11px] font-black uppercase tracking-widest text-black transition hover:opacity-90 active:scale-95">
                    <Play size={15} fill="currentColor" /> Watch
                  </Link>
                  <Link href={`/anime/${featured.malId}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/80 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-foreground backdrop-blur transition hover:bg-surface-2 active:scale-95">
                    <Info size={15} /> Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Watch</h1>
            <p className="text-[11px] text-subtle">Stream official episodes — picks, seasonal, films &amp; series</p>
          </div>
          <Link href="/bestanimelist" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition">
            Browse all <ChevronRight size={12} />
          </Link>
        </div>

        <div className="space-y-8">
          <Row title="Trending Now"      items={trendingList}             loading={trending.isLoading} />
          <Row title="New This Season"   items={seasonal.data?.data ?? []} loading={seasonal.isLoading} />
          <Row title="Series"            items={tv.data?.data ?? []}       loading={tv.isLoading} />
          <Row title="Movies"            items={movies.data?.data ?? []}   loading={movies.isLoading} />
        </div>
      </div>
    </div>
  )
}
