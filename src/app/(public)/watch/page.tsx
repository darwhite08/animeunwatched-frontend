"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, Info, Film, ChevronRight, Star } from "lucide-react"
import { useBrowseAnime, useSeasonal } from "@/hooks/useAnime"
import { WatchModal } from "@/components/anime/WatchModal"
import type { AnimeDTO } from "@/lib/api/types"

function currentSeason(): { year: number; season: string } {
  const d = new Date(); const m = d.getMonth()
  const season = m <= 2 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "fall"
  return { year: d.getFullYear(), season }
}
const matchPct = (a: AnimeDTO) => 91 + (a.malId % 8)
const titleOf = (a: AnimeDTO) => a.titleEnglish || a.title

/* image-based key art */
function Art({ src, alt, vig = true }: { src?: string | null; alt?: string; vig?: boolean }) {
  return (
    <div className="kart">
      {src && /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={alt ?? ""} loading="lazy" />}
      {vig && <div className="kart-vig" />}
    </div>
  )
}

function PosterCard({ a, onOpen, badge }: { a: AnimeDTO; onOpen: (a: AnimeDTO) => void; badge?: "new" | null }) {
  return (
    <button className="pcard" onClick={() => onOpen(a)} title={titleOf(a)}>
      <Art src={a.imageUrl} alt={titleOf(a)} />
      <div className="pcard-top">
        {a.score ? <span className="scorebadge mono"><Star size={11} fill="currentColor" /> {a.score.toFixed(1)}</span> : <span />}
        <span className="pcard-top-sp" />
        {badge === "new" && <span className="pill pill-new mono"><span className="pill-dot" />NEW</span>}
      </div>
      <span className="pcard-play"><Play size={20} className="ml-0.5" fill="currentColor" /></span>
    </button>
  )
}

function Top10Card({ a, rank, onOpen }: { a: AnimeDTO; rank: number; onOpen: (a: AnimeDTO) => void }) {
  return (
    <div className="t10">
      <span className="t10-num" data-rank={rank}>{rank}</span>
      <button className="t10-poster" onClick={() => onOpen(a)} title={titleOf(a)}><Art src={a.imageUrl} alt={titleOf(a)} /></button>
    </div>
  )
}

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="row">
      <div className="row-head"><h2 className="row-title">{title}</h2>{sub && <span className="row-sub">{sub}</span>}</div>
      <div className="row-track">{children}</div>
    </section>
  )
}

export default function WatchHubPage() {
  const [open, setOpen] = useState<AnimeDTO | null>(null)
  const [spot, setSpot] = useState(0)
  const { year, season } = currentSeason()
  const trending = useBrowseAnime({ limit: 30 })
  const seasonal = useSeasonal(year, season)
  const tv = useBrowseAnime({ type: "TV", limit: 24 })
  const movies = useBrowseAnime({ type: "Movie", limit: 24 })

  const trendingList = trending.data?.data ?? []
  const spotlight = trendingList.slice(0, 5)
  const top10 = [...trendingList].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 10)

  // auto-advance the hero spotlight
  useEffect(() => {
    if (spotlight.length < 2) return
    const t = setInterval(() => setSpot((i) => (i + 1) % spotlight.length), 9000)
    return () => clearInterval(t)
  }, [spotlight.length])

  const s = spotlight[Math.min(spot, Math.max(spotlight.length - 1, 0))]

  return (
    <div className="ks-stream min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 sm:pt-20">

        {/* Hero spotlight */}
        <div className="hero-wrap">
          {s ? (
            <div className="hero hero-cine" key={s.malId}>
              <div className="hero-bg"><Art src={s.imageUrl} alt="" vig={false} /></div>
              <div className="hero-scrim" />
              <div className="hero-scrim-bottom" />
              <div className="hero-content">
                <div className="hero-eyebrow mono"><span className="feat-ic"><Film size={14} /></span> Featured</div>
                <h1 className="hero-title">{titleOf(s)}</h1>
                <div className="hero-meta mono">
                  <span className="hero-match">{matchPct(s)}% match</span>
                  {s.year ? <><span className="hero-mdot" /><span>{s.year}</span></> : null}
                  {s.type ? <><span className="hero-mdot" /><span className="hero-rating">{s.type}</span></> : null}
                  {s.episodes ? <><span className="hero-mdot" /><span>{s.episodes} eps</span></> : null}
                </div>
                {s.synopsis && <p className="hero-synopsis">{s.synopsis}</p>}
                <div className="hero-btns">
                  <button className="btn btn-amber" onClick={() => setOpen(s)}><Play size={20} fill="currentColor" /> Watch</button>
                  <button className="btn btn-dark" onClick={() => setOpen(s)}><span className="btn-infocirc"><Info size={13} /></span> Details</button>
                </div>
              </div>
              <div className="hero-dots">
                {spotlight.map((sp, i) => (
                  <button key={sp.malId} className={"hero-dot" + (i === spot ? " on" : "")} onClick={() => setSpot(i)} aria-label={`Spotlight ${i + 1}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="hero hero-cine animate-pulse" style={{ background: "var(--app-surface)" }} />
          )}
        </div>

        {/* Section head */}
        <div className="section-head">
          <div>
            <h2 className="section-title">Watch</h2>
            <p className="section-sub">Stream official episodes — picks, seasonal, films &amp; series</p>
          </div>
          <Link href="/bestanimelist" className="browse-all">Browse all <ChevronRight size={15} /></Link>
        </div>

        {/* Rows */}
        <div className="rows">
          {top10.length > 0 && (
            <Row title="Top 10 This Week" sub="Ranked by score">
              {top10.map((a, i) => <Top10Card key={a.malId} a={a} rank={i + 1} onOpen={setOpen} />)}
            </Row>
          )}
          <Row title="Trending Now" sub="What everyone's watching">
            {trendingList.map((a) => <PosterCard key={a.malId} a={a} onOpen={setOpen} badge="new" />)}
          </Row>
          <Row title="New This Season" sub={`${season} ${year}`}>
            {(seasonal.data?.data ?? []).map((a) => <PosterCard key={a.malId} a={a} onOpen={setOpen} />)}
          </Row>
          <Row title="Series" sub="Binge-worthy">
            {(tv.data?.data ?? []).map((a) => <PosterCard key={a.malId} a={a} onOpen={setOpen} />)}
          </Row>
          <Row title="Movies" sub="Films">
            {(movies.data?.data ?? []).map((a) => <PosterCard key={a.malId} a={a} onOpen={setOpen} />)}
          </Row>
        </div>

        <footer className="ks-foot mono">KAIVERON STREAM · OFFICIAL EPISODES · SUB &amp; DUB</footer>
      </div>

      {open && <WatchModal anime={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
