"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import type { Anime } from "@/lib/data/anime"
import { useAnime } from "@/hooks/useAnime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import { useAnimeReviews } from "@/hooks/useReviews"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

/* Map API response to local Anime type for existing UI components */
function mapAPIAnime(a: AnimeDTO, rank = 1): Anime {
  return {
    id: String(a.malId),
    title: a.title,
    titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0,
    year: a.year ?? 0,
    episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown",
    genres: a.genres,
    synopsis: a.synopsis ?? "",
    image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
    category: "all",
    rank,
  }
}

function AnimeDetailLoader({ malId }: { malId: number }) {
  const { data, isLoading, isError } = useAnime(malId)

  if (isLoading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )

  if (isError || !data?.anime) return notFound()

  return <AnimeDetail anime={mapAPIAnime(data.anime)} rawAnime={data.anime} />
}
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Star, Clock, Monitor, Plus, Check, Share2, ChevronLeft,
  MessageSquare, Heart, Sparkles, PenSquare, Flag, BookOpen, Calendar, Play, Tv,
} from "lucide-react"
import EpisodeTracker from "@/components/anime/EpisodeTracker"
import { AnimeThreadsSection } from "@/components/anime/AnimeThreadsSection"
import { AnimeStatsCard } from "@/components/anime/AnimeStatsCard"
import ReviewComposer from "@/components/review/ReviewComposer"
import ReportModal from "@/components/moderation/ReportModal"
import FloatingActions from "@/components/ui/FloatingActions"
import ShareCard from "@/components/ui/ShareCard"

/* ── mock reviews ── */
const MOCK_REVIEWS = [
  { id: 1, user: "Otaku_Arch",     score: 10, body: "An absolute masterpiece. Every arc delivers, the power system is elegant, and the finale is perfection.", date: "3 days ago",  likes: 142 },
  { id: 2, user: "ShadowWatcher",  score: 9,  body: "Nearly flawless. The pacing in the middle drags slightly but the emotional payoff is unmatched in the genre.", date: "1 week ago", likes: 87  },
  { id: 3, user: "NeuralBot_X",    score: 8,  body: "Great entry point for newcomers. Familiar yet fresh, with excellent animation and a likeable cast.", date: "2 weeks ago",likes: 34  },
]

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const malId = parseInt(id, 10)

  // All IDs are now numeric malIds from the API
  if (!isNaN(malId)) return <AnimeDetailLoader malId={malId} />
  return notFound()
}

function AnimeDetail({ anime, rawAnime }: { anime: Anime; rawAnime?: AnimeDTO }) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const { data: reviewsData } = useAnimeReviews(anime.id)
  const malId = parseInt(anime.id, 10)
  const { data: similarData } = useQuery({
    queryKey: ["anime-similar", anime.id],
    queryFn: () => api<{ data: AnimeDTO[] }>(`/anime/${malId}/similar?limit=4`),
    enabled: !isNaN(malId),
  })
  const relatedAnime = similarData?.data ?? []
  const inList = has(anime.id)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [shareOpen,  setShareOpen]  = useState(false)

  const toggle = () => {
    if (inList) { remove(anime.id); push(`Removed "${anime.title}"`, "info") }
    else         { add(anime);       push(`Added "${anime.title}" to watchlist!`, "success") }
  }

  const share = () => setShareOpen(true)

  /* score → colour */
  const scoreColor = anime.rating >= 9 ? "text-emerald-400" : anime.rating >= 8 ? "text-amber-400" : "text-white/60"

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // Escape </script> to prevent script injection in JSON-LD data
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": anime.title,
            "alternateName": anime.titleJapanese,
            "description": anime.synopsis,
            "dateCreated": String(anime.year),
            "genre": anime.genres,
            "productionCompany": { "@type": "Organization", "name": anime.studio },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": anime.rating,
              "bestRating": 10,
              "worstRating": 1,
              "ratingCount": 1000
            },
            "url": `https://kaiveron.app/anime/${anime.id}`,
            "image": anime.image
          }).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />

      {/* ── HERO ── */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover object-center brightness-[0.35]"
          sizes="100vw"
          priority
        />
        {/* gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />

        {/* Rank chip */}
        <div className="absolute top-6 left-6 md:left-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-indigo-500/30 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
            #{anime.rank} Neural Ranked
          </span>
        </div>

        {/* Back button */}
        <Link
          href="/bestanimelist"
          className="absolute top-6 right-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={13} /> All Anime
        </Link>

        {/* Hero content overlay */}
        <div className="absolute bottom-8 left-6 right-6 md:left-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] md:right-auto max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic text-white"
          >
            {anime.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-sm mt-2 font-mono"
          >
            {anime.titleJapanese}
          </motion.p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-4">

        {/* Meta bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 mb-10"
        >
          {/* Score */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
            <Star size={16} fill="#f59e0b" className="text-amber-400" />
            <span className={`text-2xl font-black tracking-tighter ${scoreColor}`}>{anime.rating.toFixed(1)}</span>
            <span className="text-xs text-white/30">/10</span>
          </div>

          {/* Metadata chips */}
          {[
            { icon: Clock,    label: anime.episodes ? `${anime.episodes} eps` : "Ongoing" },
            { icon: Monitor,  label: anime.type },
            ...(anime.studio && anime.studio !== "Unknown"
              ? [{ icon: BookOpen, label: anime.studio }]
              : rawAnime?.studios && rawAnime.studios.length > 0
                ? [{ icon: BookOpen, label: rawAnime.studios[0] }]
                : []),
          ].map(m => (
            <div key={m.label} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-xl text-sm font-bold text-white/50">
              <m.icon size={14} className="text-white/30" />
              {m.label}
            </div>
          ))}

          {/* Status */}
          <span className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
            anime.status === "airing"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/40"
          }`}>
            {anime.status === "airing" ? "● Airing" : "Completed"}
          </span>

          <span className="text-sm text-white/25">{anime.year}</span>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            {rawAnime?.trailerUrl && (
              <a
                href={rawAnime.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-xs font-black uppercase tracking-widest"
              >
                <Play size={14} fill="currentColor" /> Trailer
              </a>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggle}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                inList
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_24px_rgba(99,102,241,0.35)]"
              }`}
            >
              {inList ? <><Check size={14} /> In List</> : <><Plus size={14} /> Add to List</>}
            </motion.button>

            <button
              onClick={() => setReviewOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-black uppercase tracking-widest"
            >
              <PenSquare size={14} /> Review
            </button>

            <button
              onClick={share}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/30 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all"
              title="Report this anime"
            >
              <Flag size={14} />
            </button>
          </div>
        </motion.div>

        {/* 2-col layout */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT — main info */}
          <div className="lg:col-span-2 space-y-10">

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map(g => (
                <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-white/50">
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Synopsis</h2>
              {anime.synopsis ? (
                <p className="text-white/70 text-base leading-relaxed font-medium">{anime.synopsis}</p>
              ) : (
                <p className="text-white/30 text-base leading-relaxed font-medium italic">No synopsis available.</p>
              )}
            </div>

            {/* Trailer */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Trailer</h2>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/8">
                <iframe
                  src={(() => {
                    const url = rawAnime?.trailerUrl
                    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ"
                    // convert watch?v= → embed/
                    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
                    return m ? `https://www.youtube.com/embed/${m[1]}` : "https://www.youtube.com/embed/dQw4w9WgXcQ"
                  })()}
                  title={`${anime.title} — Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
              {!rawAnime?.trailerUrl && (
                <p className="text-[9px] text-white/20 mt-2 font-mono">Placeholder trailer — official trailer coming soon</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Neural Tags</h2>
              <div className="flex flex-wrap gap-2">
                {anime.tags.map(t => (
                  <span key={t} className="px-3 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Episode Tracking */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Episode Tracking</h2>
              <EpisodeTracker totalEpisodes={anime.episodes} animeId={anime.id} />
            </div>

            {/* Community Stats */}
            <AnimeStatsCard anime={anime} />

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Community Reviews</h2>
                <button
                  onClick={() => setReviewOpen(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <PenSquare size={11} /> Write a Review
                </button>
              </div>

              <div className="space-y-4">
                {(() => {
                  const apiRevs = reviewsData?.data ?? []
                  const reviews = apiRevs.length > 0 ? apiRevs.map(r => ({
                    id: r.id, user: r.author?.displayName ?? r.author?.username ?? "?",
                    score: r.score, body: r.body, date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), likes: r._count?.likes ?? 0,
                  })) : MOCK_REVIEWS
                  return reviews.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black">
                            {r.user[0]}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">{r.user}</p>
                            <p className="text-[9px] text-white/25 mt-0.5">{r.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={12} fill="#f59e0b" className="text-amber-400" />
                          <span className="text-sm font-black text-white">{r.score}</span>
                          <span className="text-xs text-white/25">/10</span>
                        </div>
                      </div>
                      <p className="text-sm text-white/55 leading-relaxed">{r.body}</p>
                      <button className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors">
                        <Heart size={11} /> {r.likes} helpful
                      </button>
                    </motion.div>
                  ))
                })()}
              </div>
            </div>
            {/* Discussion Threads */}
            <AnimeThreadsSection animeId={anime.id} animeTitle={anime.title} />
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-6">

            {/* Quick facts */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Quick Facts</h3>
              {[
                { label: "Studio",     value: anime.studio },
                { label: "Type",       value: anime.type   },
                { label: "Year",       value: String(anime.year) },
                { label: "Episodes",   value: anime.episodes ? String(anime.episodes) : "Ongoing" },
                { label: "Status",     value: anime.status === "airing" ? "Currently Airing" : "Finished" },
                { label: "Score",      value: `${anime.rating.toFixed(1)} / 10` },
                ...(rawAnime?.season ? [{ label: "Season", value: `${rawAnime.season.charAt(0).toUpperCase()}${rawAnime.season.slice(1).toLowerCase()} ${anime.year}` }] : []),
                ...(rawAnime?.rating ? [{ label: "Age Rating", value: rawAnime.rating }] : []),
                ...(rawAnime?.source ? [{ label: "Source", value: rawAnime.source }] : []),
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center text-sm">
                  <span className="text-white/35 font-medium">{f.label}</span>
                  <span className="font-bold text-white/80 text-right max-w-[55%]">{f.value}</span>
                </div>
              ))}
            </div>

            {/* Related */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">More Like This</h3>
              <div className="space-y-3">
                {relatedAnime.map(related => (
                  <Link key={related.malId} href={`/anime/${related.malId}`}
                    className="flex items-center gap-3 group">
                    <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      {related.imageUrl && <Image src={related.imageUrl} alt={related.title} fill className="object-cover" sizes="36px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors truncate">{related.title}</p>
                      <p className="text-[9px] text-white/30 mt-0.5 flex items-center gap-1">
                        <Star size={9} fill="#f59e0b" className="text-amber-400" /> {(related.score ?? 0).toFixed(1)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Where to Watch */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <div className="flex items-center gap-2">
                <Tv size={13} className="text-white/30" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Where to Watch</h3>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Crunchyroll", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", search: `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}` },
                  { name: "Netflix",     color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       search: `https://www.netflix.com/search?q=${encodeURIComponent(anime.title)}` },
                  { name: "Funimation",  color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", search: `https://www.funimation.com/search/?q=${encodeURIComponent(anime.title)}` },
                  { name: "HiDive",      color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20",     search: `https://www.hidive.com/search#q=${encodeURIComponent(anime.title)}` },
                ].map(p => (
                  <a key={p.name} href={p.search} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] ${p.bg}`}
                  >
                    <span className={p.color}>{p.name}</span>
                    <span className="text-white/20 text-[9px]">Search →</span>
                  </a>
                ))}
              </div>
              <p className="text-[8px] text-white/15 font-mono leading-relaxed">
                Availability varies by region. Links open search results on each platform.
              </p>
            </div>

            {/* Season link */}
            <Link
              href={`/anime/season/${anime.year}/${rawAnime?.season ?? "fall"}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors group"
            >
              <Calendar size={14} className="text-white/30 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white/60 group-hover:text-white">View {anime.year} Season</p>
                <p className="text-[10px] text-white/25 mt-0.5">Browse {rawAnime?.season ?? "fall"} {anime.year} anime</p>
              </div>
            </Link>

            {/* AI Discover CTA */}
            <Link
              href="/ai-discover"
              className="flex items-center gap-3 p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/15 transition-colors group"
            >
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Find Similar Anime</p>
                <p className="text-[10px] text-white/35 mt-0.5">Use Neural Oracle to discover more</p>
              </div>
              <ChevronLeft size={14} className="text-amber-400/50 group-hover:text-amber-400 rotate-180 ml-auto transition-all group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Floating sticky actions */}
      <FloatingActions anime={anime} onReview={() => setReviewOpen(true)} />

      {/* Modals */}
      <ShareCard
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={anime.title}
        subtitle={`★ ${anime.rating.toFixed(1)} · ${anime.studio} · ${anime.year}`}
        url={typeof window !== "undefined" ? window.location.href : `https://kaiveron.app/anime/${anime.id}`}
        type="anime"
      />
      <ReviewComposer
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        animeTitle={anime.title}
        animeId={anime.id}
      />
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        contentType="post"
        contentId={anime.id}
      />
    </div>
  )
}
