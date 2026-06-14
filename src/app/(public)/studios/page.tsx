"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Building2, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import Link from "next/link"
import { FEATURED_STUDIOS, toSlug } from "@/lib/seo/taxonomy"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "",
    image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

type Studio = { name: string; monogram: string; colors: [string, string]; known: string }
type StudioName = string

// Curated branding for studios we want to spotlight. Any studio returned
// from the catalog that's not in here gets a deterministic monogram +
// color treatment so the page always looks intentional.
const STUDIO_BRAND: Record<string, Omit<Studio, "name">> = {
  "MAPPA":            { monogram: "MA", colors: ["#ef4444","#f97316"], known: "Jujutsu Kaisen, Chainsaw Man, AoT Final Season" },
  "Madhouse":         { monogram: "MH", colors: ["#8b5cf6","#6366f1"], known: "Hunter x Hunter, Death Note, OPM S1" },
  "Bones":            { monogram: "BO", colors: ["var(--app-accent)","#d97706"], known: "Fullmetal Alchemist, My Hero Academia, SK8 the Infinity" },
  "ufotable":         { monogram: "UF", colors: ["#06b6d4","#0891b2"], known: "Demon Slayer, Fate/Zero, Fate/UBW, Tales of Zestiria" },
  "Kyoto Animation":  { monogram: "KA", colors: ["#10b981","#059669"], known: "Violet Evergarden, K-On!, Clannad, Tamako Market" },
  "Trigger":          { monogram: "TR", colors: ["#ec4899","#db2777"], known: "Kill la Kill, Promare, Little Witch Academia, Cyberpunk" },
  "Wit Studio":       { monogram: "WS", colors: ["#64748b","#475569"], known: "Vinland Saga, AoT S1-3, Spy x Family, Great Pretender" },
  "A-1 Pictures":     { monogram: "A1", colors: ["#6366f1","#4f46e5"], known: "SAO, Kaguya-sama, Your Lie in April, Fairy Tail" },
  "Shaft":            { monogram: "SH", colors: ["#a855f7","#7c3aed"], known: "Monogatari Series, Madoka Magica, Nisekoi, 3-gatsu" },
  "Sunrise":          { monogram: "SR", colors: ["#f97316","#ea580c"], known: "Gundam, Code Geass, Cowboy Bebop, Love Live!" },
  "White Fox":        { monogram: "WF", colors: ["#e2e8f0","#94a3b8"], known: "Re:Zero, Steins;Gate, Goblin Slayer, Katanagatari" },
  "Gainax":           { monogram: "GX", colors: ["#0ea5e9","#0284c7"], known: "Neon Genesis Evangelion, FLCL, Gurren Lagann, Gunbuster" },
  "J.C.Staff":        { monogram: "JC", colors: ["#84cc16","#65a30d"], known: "Toradora, Food Wars, DanMachi, Shakugan no Shana" },
  "Production I.G":   { monogram: "IG", colors: ["#14b8a6","#0d9488"], known: "Ghost in the Shell, Haikyuu!!, Attack on Titan, Eden of East" },
  "CloverWorks":      { monogram: "CW", colors: ["#f43f5e","#e11d48"], known: "Oshi no Ko, The Promised Neverland S2, Spy x Family S2" },
  "David Production": { monogram: "DP", colors: ["var(--app-accent-bright)","var(--app-accent)"], known: "JoJo's Bizarre Adventure, Dr. Stone, Cells at Work!" },
  "OLM":              { monogram: "OL", colors: ["#22d3ee","#06b6d4"], known: "Pokémon, Inazuma Eleven, Berserk (1997)" },
  "Doga Kobo":        { monogram: "DK", colors: ["#fb7185","#f43f5e"], known: "Himouto Umaru-chan, Gabriel DropOut, Yuruyuri" },
  "Silver Link":      { monogram: "SL", colors: ["#c0c0c0","#9ca3af"], known: "Non Non Biyori, Chivalry of a Failed Knight, Strike the Blood" },
  "Toei Animation":   { monogram: "TA", colors: ["#ef4444","#b91c1c"], known: "Dragon Ball, One Piece, Sailor Moon, Digimon, Pretty Cure" },
  "Brain's Base":     { monogram: "BB", colors: ["#7c3aed","#5b21b6"], known: "Durarara!!, Natsume's Book of Friends, Baccano!" },
  "Lerche":           { monogram: "LE", colors: ["#2dd4bf","#14b8a6"], known: "Assassination Classroom, Danganronpa, Toilet-bound Hanako-kun" },
}

const DEFAULT_PALETTES: Array<[string, string]> = [
  ["#6366f1","#4f46e5"], ["#10b981","#059669"], ["#f97316","#ea580c"],
  ["#ec4899","#db2777"], ["#06b6d4","#0891b2"], ["#a855f7","#7c3aed"],
]

function brandFor(name: string, count: number): Studio {
  const existing = STUDIO_BRAND[name]
  if (existing) return { name, ...existing }
  const words = name.split(/\s+/).filter(Boolean)
  // Multi-word → first letter of each (up to 2); single word → first two letters.
  const initials = (words.length > 1
    ? words.map(w => w[0]).join("")
    : (words[0] ?? name)
  ).replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "??"
  const hash = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0)
  const palette = DEFAULT_PALETTES[hash % DEFAULT_PALETTES.length]
  return {
    name,
    monogram: initials,
    colors:   palette,
    known:    `${count} title${count === 1 ? "" : "s"} in catalog`,
  }
}

const LIMIT = 24

function StudioPanel({ studio, onAnimeClick }: { studio: StudioName; onAnimeClick: (a: Anime) => void }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useBrowseAnime({ studio, limit: LIMIT, page })
  const anime = (data?.data ?? []).map(mapDTO)
  const totalPages = data?.meta?.pages ?? 1
  const totalAnime = data?.meta?.total ?? 0
  const s = brandFor(studio, totalAnime)

  return (
    <div className="mt-4 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{
              width: 40, height: 40, flexShrink: 0, borderRadius: 12, position: "relative",
              background: `linear-gradient(140deg, ${s.colors[0]}, ${s.colors[1]})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 5px 14px -6px ${s.colors[0]}80, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.10)`,
            }}
          >
            <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 12, background: "radial-gradient(120% 80% at 30% 0%, rgba(255,255,255,0.30), transparent 60%)" }} />
            <span style={{ position: "relative", color: "white", fontWeight: 900, fontSize: 13, letterSpacing: "0.01em", textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}>{s.monogram}</span>
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground truncate">{studio}</h3>
        </div>
        {!isLoading && (
          <span className="shrink-0 text-[10px] font-black text-subtle uppercase tracking-widest">
            {totalAnime.toLocaleString()} titles
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      )}
      {isError && !isLoading && (
        <p className="text-subtle text-xs font-black uppercase tracking-widest py-10 text-center">
          Failed to load {studio} anime
        </p>
      )}
      {!isLoading && !isError && anime.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {anime.map((a, i) => (
              <AnimeCard key={a.id} anime={a} index={i} onClick={onAnimeClick} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-black text-muted px-3">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
      {!isLoading && !isError && anime.length === 0 && (
        <p className="text-subtle font-black uppercase text-xs tracking-widest py-10 text-center">
          No {studio} anime in the archive yet
        </p>
      )}
    </div>
  )
}

export default function StudiosPage() {
  const [activeStudio, setActiveStudio] = useState<StudioName | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  // Live catalog: top 24 studios by anime count. Each gets curated branding
  // when we have it, otherwise auto-generated initials + palette.
  const { data: studiosData } = useQuery({
    queryKey: ["catalog-studios", 24],
    queryFn:  () => api<{ data: Array<{ name: string; count: number }> }>("/anime/studios?limit=24"),
    staleTime: 60_000,
  })
  const STUDIOS: Studio[] = (studiosData?.data ?? []).map(s => brandFor(s.name, s.count))

  function toggleStudio(name: StudioName) {
    setActiveStudio(prev => prev === name ? null : name)
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-14">
        <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4"
        >
          <Building2 size={13} /> Production Houses
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-foreground italic leading-none"
        >
          Studio<span className="text-violet-500">.</span>
          <br /><span className="text-subtle">Archive</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mt-4 text-subtle text-sm font-medium"
        >
          {STUDIOS.length} studios · click to explore their catalogue
        </motion.p>

        {/* Crawlable links to per-studio landing pages — programmatic SEO
            surfaces indexed via real <a> tags. */}
        <nav aria-label="Anime by studio" className="mt-8 flex flex-wrap gap-2">
          {FEATURED_STUDIOS.map((name) => (
            <Link
              key={name}
              href={`/studios/${toSlug(name)}`}
              className="rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-subtle transition hover:border-violet-500/40 hover:text-foreground"
            >
              {name} Anime
            </Link>
          ))}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUDIOS.map((s, i) => {
            const isOpen = activeStudio === s.name
            return (
              <div key={s.name} className="flex flex-col">
                <motion.button
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleStudio(s.name)}
                  className={`w-full text-left rounded-2xl border bg-surface overflow-hidden transition-all duration-300 hover:border-border hover:bg-surface ${
                    isOpen ? "ring-1 ring-violet-500/30 border-violet-900/40" : "border-border"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{
                            width: 48, height: 48, flexShrink: 0,
                            borderRadius: 14,
                            background: `linear-gradient(140deg, ${s.colors[0]}, ${s.colors[1]})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            position: "relative",
                            boxShadow: `0 6px 18px -6px ${s.colors[0]}80, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.10)`,
                          }}
                        >
                          {/* soft top-light sheen for a crafted, badge-like finish */}
                          <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 14, background: "radial-gradient(120% 80% at 30% 0%, rgba(255,255,255,0.30), transparent 60%)" }} />
                          <span style={{ position: "relative", color: "white", fontWeight: 900, fontSize: 15, letterSpacing: "0.01em", textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}>{s.monogram}</span>
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-black uppercase italic tracking-tight text-foreground truncate">{s.name}</h2>
                          <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: s.colors[0] + "99" }}>Production Studio</p>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                        className="text-subtle shrink-0 ml-2">
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                    <p className="text-[10px] text-subtle leading-relaxed pl-[60px]">{s.known}</p>
                    <div className="mt-3 flex items-center gap-1.5 pl-[60px]" style={{ color: s.colors[0] + "99" }}>
                      <Building2 size={10} />
                      <span className="text-[9px] font-black uppercase tracking-widest">View Catalogue →</span>
                    </div>
                  </div>
                </motion.button>

                {/* Mobile inline */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div key="inline"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden lg:hidden"
                    >
                      <StudioPanel studio={s.name} onAnimeClick={setSelectedAnime} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Desktop expanded panel */}
        <AnimatePresence>
          {activeStudio && (
            <motion.div key={activeStudio}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden hidden lg:block mt-6"
            >
              <StudioPanel studio={activeStudio} onAnimeClick={setSelectedAnime} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
