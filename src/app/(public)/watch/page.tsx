"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Play, Info, ChevronRight, ChevronLeft, ChevronDown, Star, Plus, Check,
  ThumbsUp, X, Zap,
} from "lucide-react"
import { getWatchSources, getWatchCatalog } from "@/lib/api/endpoints"
import { WatchModal } from "@/components/anime/WatchModal"
import type { AnimeDTO } from "@/lib/api/types"

/* ── map real anime → stream card shape ───────────────────────────────── */
type S = {
  id: string; malId: number; title: string; kanji: string; year: number; eps: number
  studio: string; rating: string; score: number; season: string; simulcast: boolean
  sub: boolean; dub: boolean; genres: string[]; synopsis: string; imageUrl: string | null; dto: AnimeDTO
}
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1)
function toS(a: AnimeDTO): S {
  const airing = (a.status || "").toLowerCase().includes("airing")
  return {
    id: String(a.malId), malId: a.malId, title: a.titleEnglish || a.title, kanji: a.titleJapanese || "",
    year: a.year ?? 0, eps: a.episodes ?? 0, studio: a.studios?.[0] ?? "—",
    rating: a.type || "TV", score: a.score ?? 0,
    season: a.season && a.year ? `${cap(a.season)} ${a.year}` : (a.year ? String(a.year) : "Catalog"),
    simulcast: airing, sub: true, dub: true, genres: a.genres ?? [], synopsis: a.synopsis ?? "",
    imageUrl: a.imageUrl, dto: a,
  }
}
const match = (s: S) => 91 + (s.malId % 8)

/* ── primitives ───────────────────────────────────────────────────────── */
function Art({ src, alt, vig = true }: { src?: string | null; alt?: string; vig?: boolean }) {
  return <div className="kart">{src && /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={alt ?? ""} loading="lazy" />}{vig && <div className="kart-vig" />}</div>
}
function LangTags({ langs }: { langs: string[] }) {
  return <div className="langtags">{langs.map((l) => <span key={l} className={"langtag " + (l === "DUB" ? "dub" : "sub")}>{l}</span>)}</div>
}
function ScoreBadge({ score }: { score: number }) {
  return <span className="scorebadge mono"><Star size={11} fill="currentColor" /> {score.toFixed(1)}</span>
}
const langsOf = (s: S) => [s.sub && "SUB", s.dub && "DUB"].filter(Boolean) as string[]

/* ── cards ────────────────────────────────────────────────────────────── */
function PosterCard({ s, badge, onOpen, onHover, onLeave }: { s: S; badge?: "new" | null; onOpen: (s: S) => void; onHover: (s: S, el: HTMLElement | null) => void; onLeave: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <button ref={ref} className="pcard" onMouseEnter={() => onHover(s, ref.current)} onMouseLeave={onLeave} onClick={() => onOpen(s)} title={s.title}>
      <Art src={s.imageUrl} alt={s.title} />
      <div className="pcard-top">
        <ScoreBadge score={s.score} /><span className="pcard-top-sp" />
        {badge === "new" ? <span className="pill pill-new mono"><span className="pill-dot" />NEW</span> : s.simulcast ? <span className="pill pill-sim mono">SIM</span> : null}
      </div>
    </button>
  )
}
function ContinueCard({ s, ep, pct, left, onOpen }: { s: S; ep: number; pct: number; left: string; onOpen: (s: S) => void }) {
  return (
    <button className="ccard" onClick={() => onOpen(s)} title={s.title}>
      <div className="ccard-art">
        <Art src={s.imageUrl} alt={s.title} vig={false} />
        <div className="ccard-play"><Play size={20} fill="currentColor" /></div>
        <div className="ccard-ep mono">EP {ep}</div><div className="ccard-left mono">{left}</div>
        <div className="ccard-progress"><span style={{ width: pct * 100 + "%" }} /></div>
      </div>
      <div className="ccard-body"><div className="ccard-title">{s.title}</div><div className="ccard-sub">Resume episode {ep}</div></div>
    </button>
  )
}
function NewEpCard({ s, ep, ago, fresh, onOpen }: { s: S; ep: number; ago: string; fresh: boolean; onOpen: (s: S) => void }) {
  return (
    <button className="ncard" onClick={() => onOpen(s)} title={s.title}>
      <div className="ncard-art">
        <Art src={s.imageUrl} alt={s.title} vig={false} />
        <div className="ccard-play"><Play size={20} fill="currentColor" /></div>
        {fresh && <div className="ncard-fresh mono"><Zap size={11} fill="currentColor" /> JUST AIRED</div>}
        <div className="ncard-epbadge mono">EP {ep}</div>
      </div>
      <div className="ccard-body"><div className="ncard-row"><div className="ccard-title">{s.title}</div><LangTags langs={langsOf(s)} /></div><div className="ccard-sub">Episode {ep} · {ago}</div></div>
    </button>
  )
}
function Top10Card({ s, rank, onOpen, onHover, onLeave }: { s: S; rank: number; onOpen: (s: S) => void; onHover: (s: S, el: HTMLElement | null) => void; onLeave: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <div className="t10" onMouseEnter={() => onHover(s, ref.current)} onMouseLeave={onLeave}>
      <span className="t10-num" data-rank={rank}>{rank}</span>
      <button ref={ref} className="t10-poster" onClick={() => onOpen(s)} title={s.title}><Art src={s.imageUrl} alt={s.title} /></button>
    </div>
  )
}
function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true); const [atEnd, setAtEnd] = useState(false)
  const onScroll = useCallback(() => { const el = track.current; if (!el) return; setAtStart(el.scrollLeft < 8); setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8) }, [])
  useEffect(() => { onScroll() }, [onScroll, children])
  const nudge = (d: number) => { const el = track.current; if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: "smooth" }) }
  return (
    <section className="row">
      <div className="row-head"><h2 className="row-title">{title}</h2>{sub && <span className="row-sub">{sub}</span>}</div>
      <div className="row-track-wrap">
        <button className={"row-arrow left" + (atStart ? " hide" : "")} onClick={() => nudge(-1)} aria-label="Scroll left"><ChevronLeft size={22} /></button>
        <div className="row-track" ref={track} onScroll={onScroll}>{children}</div>
        <button className={"row-arrow right" + (atEnd ? " hide" : "")} onClick={() => nudge(1)} aria-label="Scroll right"><ChevronRight size={22} /></button>
      </div>
    </section>
  )
}

/* ── hero ─────────────────────────────────────────────────────────────── */
function HeroMeta({ s }: { s: S }) {
  return (
    <div className="hero-meta mono">
      <span className="hero-match">{match(s)}% match</span><span className="hero-mdot" /><span>{s.year || "—"}</span>
      <span className="hero-mdot" /><span className="hero-rating">{s.rating}</span>
      {s.eps ? <><span className="hero-mdot" /><span>{s.eps} eps</span></> : null}
      <span className="hero-mdot" /><LangTags langs={langsOf(s)} />
    </div>
  )
}
function HeroBtns({ s, onPlay, onMore }: { s: S; onPlay: (s: S) => void; onMore: (s: S) => void }) {
  return (
    <div className="hero-btns">
      <button className="btn btn-amber" onClick={() => onPlay(s)}><Play size={20} fill="currentColor" /> Watch</button>
      <button className="btn btn-dark" onClick={() => onMore(s)}><span className="btn-infocirc"><Info size={13} /></span> Details</button>
    </div>
  )
}
function Dots({ list, active, onDot }: { list: S[]; active: number; onDot: (i: number) => void }) {
  return <div className="hero-dots">{list.map((s, i) => <button key={s.id} className={"hero-dot" + (i === active ? " on" : "")} onClick={() => onDot(i)} aria-label={`Spotlight ${i + 1}`} />)}</div>
}
function HeroSplit({ s, list, active, onDot, onPlay, onMore }: { s: S; list: S[]; active: number; onDot: (i: number) => void; onPlay: (s: S) => void; onMore: (s: S) => void }) {
  return (
    <div className="hero hero-split" key={s.id}>
      <div className="hero-bg"><Art src={s.imageUrl} vig={false} /></div>
      <div className="hero-scrim solid" />
      <div className="hero-split-in">
        <div>
          <div className="hero-eyebrow mono"><Star size={13} fill="currentColor" /> #{active + 1} SPOTLIGHT · {s.season.toUpperCase()}</div>
          <h1 className="hero-title">{s.title}</h1>
          <div className="hero-kanji-line">{s.kanji && <span className="hero-kanji">{s.kanji}</span>}<span className="hero-studio mono">{s.studio}</span></div>
          <HeroMeta s={s} />
          {s.synopsis && <p className="hero-synopsis">{s.synopsis}</p>}
          <div className="hero-statgrid">
            <div className="hero-stat"><span className="hero-stat-n mono">{s.score.toFixed(1)}</span><span className="hero-stat-l">User score</span></div>
            <div className="hero-stat"><span className="hero-stat-n mono">{s.eps || "—"}</span><span className="hero-stat-l">Episodes</span></div>
            <div className="hero-stat"><span className="hero-stat-n mono">{s.year || "—"}</span><span className="hero-stat-l">Premiered</span></div>
          </div>
          <HeroBtns s={s} onPlay={onPlay} onMore={onMore} />
        </div>
        <div className="hero-split-poster"><Art src={s.imageUrl} /><button className="hero-poster-play" onClick={() => onPlay(s)}><Play size={26} fill="currentColor" /></button></div>
      </div>
      <Dots list={list} active={active} onDot={onDot} />
    </div>
  )
}
/* ── hover preview (Netflix floating card) ────────────────────────────── */
function HoverPreview({ data, inList, onOpen, onPlay, onToggle, onLike, onEnter, onLeave }: { data: { s: S; rect: DOMRect } | null; inList: boolean; onOpen: (s: S) => void; onPlay: (s: S) => void; onToggle: (s: S) => void; onLike: (s: S) => void; onEnter: () => void; onLeave: () => void }) {
  if (!data) return null
  const { s, rect } = data
  const W = Math.min(380, Math.max(300, rect.width * 1.62))
  let left = rect.left + rect.width / 2 - W / 2
  left = Math.max(18, Math.min(left, window.innerWidth - W - 18))
  const top = Math.max(12, rect.top - 54)
  return (
    <div className="hoverprev ks-stream" style={{ left, top, width: W }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button className="hoverprev-art" onClick={() => onPlay(s)}>
        <Art src={s.imageUrl} vig={false} />
        <div className="hoverprev-playwrap"><span className="hoverprev-play"><Play size={20} fill="currentColor" /></span></div>
        {s.simulcast && <span className="pill pill-sim mono hoverprev-pill">SIMULCAST</span>}
      </button>
      <div className="hoverprev-body">
        <div className="hoverprev-actions">
          <button className="circ filled" onClick={() => onPlay(s)} aria-label="Play"><Play size={16} fill="currentColor" /></button>
          <button className={"circ" + (inList ? " on" : "")} onClick={() => onToggle(s)} aria-label="My list">{inList ? <Check size={16} /> : <Plus size={16} />}</button>
          <button className="circ" onClick={() => onLike(s)} aria-label="Like"><ThumbsUp size={15} /></button>
          <span className="hoverprev-sp" />
          <button className="circ" onClick={() => onOpen(s)} aria-label="Details"><ChevronDown size={18} /></button>
        </div>
        <div className="hoverprev-meta mono">
          <span className="hoverprev-match">{match(s)}% match</span><span className="hoverprev-rating">{s.rating}</span>{s.eps ? <span>{s.eps} eps</span> : null}<LangTags langs={langsOf(s)} />
        </div>
        <div className="hoverprev-genres">{s.genres.slice(0, 3).map((g, i) => <span key={g}>{i > 0 && <span className="gdot" />}{g}</span>)}</div>
      </div>
    </div>
  )
}

/* ── detail modal (rich, real episodes) ───────────────────────────────── */
function DetailModal({ s, inList, onClose, onPlay, onToggle }: { s: S; inList: boolean; onClose: () => void; onPlay: (s: S) => void; onToggle: (s: S) => void }) {
  useEffect(() => { const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", fn); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = "" } }, [onClose])
  const { data } = useQuery({ queryKey: ["watch-sources", s.malId], queryFn: () => getWatchSources(s.malId), staleTime: 5 * 60_000 })
  const sources = data?.sources ?? []
  return (
    <div className="ks-stream-modal-scrim" onClick={onClose}>
      <div className="ks-stream-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <div className="modal-hero">
          {s.imageUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.imageUrl} alt="" />}
          <div className="modal-hero-scrim" />
          <div className="modal-hero-in">
            <div className="modal-eyebrow">{s.studio} · {s.season}</div>
            <h2 className="modal-title">{s.title}</h2>
            <div className="modal-btns">
              <button className="btn btn-amber" onClick={() => onPlay(s)}><Play size={20} fill="currentColor" /> Watch</button>
              <button className={"btn btn-ghost" + (inList ? " on" : "")} onClick={() => onToggle(s)}>{inList ? <><Check size={18} /> In list</> : <><Plus size={18} /> My list</>}</button>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <div>
            <div className="modal-metarow mono">
              <span className="modal-match">{match(s)}% match</span><span>{s.year || "—"}</span><span className="hero-rating">{s.rating}</span>{s.eps ? <span>{s.eps} eps</span> : null}<LangTags langs={langsOf(s)} />
            </div>
            <p className="modal-synopsis">{s.synopsis || "No synopsis available."}</p>
            <div className="modal-eps">
              <div className="modal-eps-head"><h3>Episodes</h3><span className="mono">{sources.length ? `${sources.length} available` : "Official sources"}</span></div>
              {sources.length > 0 ? sources.map((src) => (
                <button key={src.videoId} className="eprow" onClick={() => onPlay(s)}>
                  <span className="eprow-n mono">{src.episode ?? "•"}</span>
                  <div className="eprow-thumb">{s.imageUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.imageUrl} alt="" />}<span className="eprow-play"><Play size={16} fill="currentColor" /></span></div>
                  <div className="eprow-body"><div className="eprow-title">{src.episode != null ? `Episode ${src.episode}` : src.title}</div><div className="eprow-sub">{src.channel}</div></div>
                  <ChevronRight size={16} className="eprow-run" />
                </button>
              )) : (
                <button className="eprow" onClick={() => onPlay(s)}>
                  <span className="eprow-n mono">▶</span>
                  <div className="eprow-thumb">{s.imageUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.imageUrl} alt="" />}<span className="eprow-play"><Play size={16} fill="currentColor" /></span></div>
                  <div className="eprow-body"><div className="eprow-title">Watch now</div><div className="eprow-sub">Find an official stream</div></div>
                </button>
              )}
            </div>
          </div>
          <aside className="modal-side">
            <div className="modal-fact"><span className="modal-fact-l">USER SCORE</span><span className="modal-fact-v"><Star size={15} fill="currentColor" /> {s.score.toFixed(1)} / 10</span></div>
            <div className="modal-fact"><span className="modal-fact-l">STUDIO</span><span className="modal-fact-v">{s.studio}</span></div>
            <div className="modal-fact"><span className="modal-fact-l">GENRES</span><span className="modal-tags">{s.genres.map((g) => <span key={g} className="genre-chip sm">{g}</span>)}</span></div>
            <div className="modal-fact"><span className="modal-fact-l">AUDIO</span><span className="modal-fact-v">{[s.sub && "Japanese (Sub)", s.dub && "English (Dub)"].filter(Boolean).join(" · ")}</span></div>
            <div className="modal-fact"><span className="modal-fact-l">STATUS</span><span className="modal-fact-v">{s.simulcast ? "Simulcast · airing" : "Complete"}</span></div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ══ page ══════════════════════════════════════════════════════════════ */
const seasonNow = () => { const d = new Date(); const m = d.getMonth(); return { year: d.getFullYear(), season: m <= 2 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "fall" } }

export default function WatchHubPage() {
  // Only anime that actually have wired (playable) episodes.
  const catalog = useQuery({ queryKey: ["watch-catalog"], queryFn: getWatchCatalog, staleTime: 5 * 60_000 })

  const [spot, setSpot] = useState(0)
  const [list, setList] = useState<Set<number>>(new Set())
  const [detail, setDetail] = useState<S | null>(null)
  const [hover, setHover] = useState<{ s: S; rect: DOMRect } | null>(null)
  const [watch, setWatch] = useState<AnimeDTO | null>(null)
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([])
  const showT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null)

  // localStorage: My List + hero dir + recently opened (continue)
  useEffect(() => { try { setList(new Set(JSON.parse(localStorage.getItem("ks-list") || "[]"))) } catch { /* */ } }, [])
  useEffect(() => { try { localStorage.setItem("ks-list", JSON.stringify([...list])) } catch { /* */ } }, [list])

  const wired = (catalog.data?.data ?? []).map(toS)
  const pool = new Map<number, S>()
  for (const s of wired) if (!pool.has(s.malId)) pool.set(s.malId, s)

  const spotlight = wired.slice(0, 5)
  const myList = [...list].map((id) => pool.get(id)).filter(Boolean) as S[]
  // "Continue" from recently opened titles (localStorage), synthetic progress
  const continueList: { s: S; ep: number; pct: number; left: string }[] = (() => {
    let ids: number[] = []
    try { ids = JSON.parse(localStorage.getItem("ks-continue") || "[]") } catch { /* */ }
    return ids.map((id) => pool.get(id)).filter(Boolean).slice(0, 6).map((s, i) => ({ s: s as S, ep: (i % 8) + 1, pct: [0.3, 0.6, 0.15, 0.8, 0.45, 0.9][i % 6], left: `${[8, 4, 19, 2, 14, 6][i % 6]} min left` }))
  })()

  useEffect(() => { if (spotlight.length < 2) return; const t = setInterval(() => setSpot((i) => (i + 1) % spotlight.length), 9000); return () => clearInterval(t) }, [spotlight.length])

  const toast = useCallback((text: string) => { const id = Math.random().toString(36).slice(2); setToasts((p) => [...p, { id, text }]); setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2400) }, [])
  const inList = (s: S) => list.has(s.malId)
  const toggle = (s: S) => setList((prev) => { const n = new Set(prev); if (n.has(s.malId)) { n.delete(s.malId); toast("Removed from My List") } else { n.add(s.malId); toast("Added to My List") } return n })
  const open = (s: S) => { if (hideT.current) clearTimeout(hideT.current); if (showT.current) clearTimeout(showT.current); setHover(null); setDetail(s) }
  const play = (s: S) => { setHover(null); setDetail(null); try { const ids: number[] = JSON.parse(localStorage.getItem("ks-continue") || "[]"); localStorage.setItem("ks-continue", JSON.stringify([s.malId, ...ids.filter((x) => x !== s.malId)].slice(0, 12))) } catch { /* */ } setWatch(s.dto) }
  const like = (s: S) => toast("Liked " + s.title)
  const onHover = (s: S, el: HTMLElement | null) => { if (!el) return; if (hideT.current) clearTimeout(hideT.current); if (showT.current) clearTimeout(showT.current); const rect = el.getBoundingClientRect(); showT.current = setTimeout(() => setHover({ s, rect }), 420) }
  const onLeave = () => { if (showT.current) clearTimeout(showT.current); hideT.current = setTimeout(() => setHover(null), 160) }

  const s = spotlight[Math.min(spot, Math.max(spotlight.length - 1, 0))]

  return (
    <div className="ks-stream min-h-screen bg-background text-foreground pb-24">
      <div className="-mt-5">
        {/* Full-bleed editorial hero — flush under the topbar (no gap) */}
        <div className="hero-wrap">
          {s ? <HeroSplit s={s} list={spotlight} active={spot} onDot={setSpot} onPlay={play} onMore={open} />
            : <div className="hero hero-split animate-pulse" style={{ background: "var(--app-surface)" }} />}
        </div>

        <div className="px-4 sm:px-8">
        <div className="section-head">
          <div><h2 className="section-title">Watch</h2><p className="section-sub">Official episodes — available to stream on Kaiveron now</p></div>
          <Link href="/bestanimelist" className="browse-all">Browse catalog <ChevronRight size={15} /></Link>
        </div>

        <div className="rows">
          {continueList.length > 0 && <Row title="Continue Watching" sub="Pick up where you left off">{continueList.map(({ s, ep, pct, left }) => <ContinueCard key={s.malId} s={s} ep={ep} pct={pct} left={left} onOpen={open} />)}</Row>}
          {wired.length > 0 && <Row title="Available to Watch" sub="Official episodes, ready to play">{wired.map((s) => <PosterCard key={s.malId} s={s} onOpen={open} onHover={onHover} onLeave={onLeave} />)}</Row>}
          {myList.length > 0 && <Row title="My List" sub="Saved for later">{myList.map((s) => <PosterCard key={s.malId} s={s} onOpen={open} onHover={onHover} onLeave={onLeave} />)}</Row>}
          {!catalog.isLoading && wired.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-sm font-bold text-muted">No titles wired with episodes yet.</p>
              <p className="mt-1 text-xs text-subtle">Official streams appear here as soon as they&apos;re added.</p>
            </div>
          )}
        </div>

        <footer className="ks-foot mono">KAIVERON STREAM · OFFICIAL EPISODES · SUB &amp; DUB</footer>
        </div>
      </div>

      <HoverPreview data={hover} inList={hover ? inList(hover.s) : false} onOpen={open} onPlay={play} onToggle={toggle} onLike={like}
        onEnter={() => { if (hideT.current) clearTimeout(hideT.current) }} onLeave={() => { hideT.current = setTimeout(() => setHover(null), 120) }} />
      {detail && <DetailModal s={detail} inList={inList(detail)} onClose={() => setDetail(null)} onPlay={play} onToggle={toggle} />}
      {watch && <WatchModal anime={watch} onClose={() => setWatch(null)} />}

      <div className="ks-stream-toasts">{toasts.map((t) => <div key={t.id} className="ks-stream-toast"><Check size={16} /> {t.text}</div>)}</div>
    </div>
  )
}
