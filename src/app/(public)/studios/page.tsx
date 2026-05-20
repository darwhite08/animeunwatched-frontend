"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Building2, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"

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

const STUDIOS = [
  { name: "MAPPA",            monogram: "MA", colors: ["#ef4444","#f97316"], known: "Jujutsu Kaisen, Chainsaw Man, AoT Final Season" },
  { name: "Madhouse",         monogram: "MH", colors: ["#8b5cf6","#6366f1"], known: "Hunter x Hunter, Death Note, OPM S1" },
  { name: "Bones",            monogram: "BO", colors: ["#f59e0b","#d97706"], known: "Fullmetal Alchemist, My Hero Academia, SK8 the Infinity" },
  { name: "ufotable",         monogram: "UF", colors: ["#06b6d4","#0891b2"], known: "Demon Slayer, Fate/Zero, Fate/UBW, Tales of Zestiria" },
  { name: "Kyoto Animation",  monogram: "KA", colors: ["#10b981","#059669"], known: "Violet Evergarden, K-On!, Clannad, Tamako Market" },
  { name: "Trigger",          monogram: "TR", colors: ["#ec4899","#db2777"], known: "Kill la Kill, Promare, Little Witch Academia, Cyberpunk" },
  { name: "Wit Studio",       monogram: "WS", colors: ["#64748b","#475569"], known: "Vinland Saga, AoT S1-3, Spy x Family, Great Pretender" },
  { name: "A-1 Pictures",     monogram: "A1", colors: ["#6366f1","#4f46e5"], known: "SAO, Kaguya-sama, Your Lie in April, Fairy Tail" },
  { name: "Shaft",            monogram: "SH", colors: ["#a855f7","#7c3aed"], known: "Monogatari Series, Madoka Magica, Nisekoi, 3-gatsu" },
  { name: "Sunrise",          monogram: "SR", colors: ["#f97316","#ea580c"], known: "Gundam, Code Geass, Cowboy Bebop, Love Live!" },
  { name: "White Fox",        monogram: "WF", colors: ["#e2e8f0","#94a3b8"], known: "Re:Zero, Steins;Gate, Goblin Slayer, Katanagatari" },
  { name: "Gainax",           monogram: "GX", colors: ["#0ea5e9","#0284c7"], known: "Neon Genesis Evangelion, FLCL, Gurren Lagann, Gunbuster" },
  { name: "J.C.Staff",        monogram: "JC", colors: ["#84cc16","#65a30d"], known: "Toradora, Food Wars, DanMachi, Shakugan no Shana" },
  { name: "Production I.G",   monogram: "IG", colors: ["#14b8a6","#0d9488"], known: "Ghost in the Shell, Haikyuu!!, Attack on Titan, Eden of East" },
  { name: "CloverWorks",      monogram: "CW", colors: ["#f43f5e","#e11d48"], known: "Oshi no Ko, The Promised Neverland S2, Spy x Family S2" },
  { name: "David Production", monogram: "DP", colors: ["#fbbf24","#f59e0b"], known: "JoJo's Bizarre Adventure, Dr. Stone, Cells at Work!" },
  { name: "OLM",              monogram: "OL", colors: ["#22d3ee","#06b6d4"], known: "Pokémon, Inazuma Eleven, Berserk (1997)" },
  { name: "Doga Kobo",        monogram: "DK", colors: ["#fb7185","#f43f5e"], known: "Himouto Umaru-chan, Gabriel DropOut, Yuruyuri" },
  { name: "Silver Link",      monogram: "SL", colors: ["#c0c0c0","#9ca3af"], known: "Non Non Biyori, Chivalry of a Failed Knight, Strike the Blood" },
  { name: "Toei Animation",   monogram: "TA", colors: ["#ef4444","#b91c1c"], known: "Dragon Ball, One Piece, Sailor Moon, Digimon, Pretty Cure" },
  { name: "Brain's Base",     monogram: "BB", colors: ["#7c3aed","#5b21b6"], known: "Durarara!!, Natsume's Book of Friends, Baccano!" },
  { name: "Lerche",           monogram: "LE", colors: ["#2dd4bf","#14b8a6"], known: "Assassination Classroom, Danganronpa, Toilet-bound Hanako-kun" },
] as const

type StudioName = typeof STUDIOS[number]["name"]

const LIMIT = 24

function StudioPanel({ studio, onAnimeClick }: { studio: StudioName; onAnimeClick: (a: Anime) => void }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useBrowseAnime({ studio, limit: LIMIT, page })
  const anime = (data?.data ?? []).map(mapDTO)
  const totalPages = data?.meta?.pages ?? 1
  const totalAnime = data?.meta?.total ?? 0
  const s = STUDIOS.find(x => x.name === studio)!

  return (
    <div className="mt-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${s.colors[0]}, ${s.colors[1]})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 13, fontStyle: "italic", letterSpacing: "-0.02em" }}>{s.monogram}</span>
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">{studio}</h3>
        </div>
        {!isLoading && (
          <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">
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
        <p className="text-white/20 text-xs font-black uppercase tracking-widest py-10 text-center">
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
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-black text-white/40 px-3">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
      {!isLoading && !isError && anime.length === 0 && (
        <p className="text-white/20 font-black uppercase text-xs tracking-widest py-10 text-center">
          No {studio} anime in the archive yet
        </p>
      )}
    </div>
  )
}

export default function StudiosPage() {
  const [activeStudio, setActiveStudio] = useState<StudioName | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  function toggleStudio(name: StudioName) {
    setActiveStudio(prev => prev === name ? null : name)
  }

  return (
    <div className="min-h-screen bg-[#020202] pb-40">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-14">
        <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4"
        >
          <Building2 size={13} /> Production Houses
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-white italic leading-none"
        >
          Studio<span className="text-violet-500">.</span>
          <br /><span className="text-white/20">Archive</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mt-4 text-white/30 text-sm font-medium"
        >
          {STUDIOS.length} studios · click to explore their catalogue
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUDIOS.map((s, i) => {
            const isOpen = activeStudio === s.name
            return (
              <div key={s.name} className="flex flex-col">
                <motion.button
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleStudio(s.name)}
                  className={`w-full text-left rounded-2xl border bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] ${
                    isOpen ? "ring-1 ring-violet-500/30 border-violet-900/40" : "border-white/5"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${s.colors[0]}, ${s.colors[1]})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "white", fontWeight: 900, fontSize: 14, fontStyle: "italic", letterSpacing: "-0.02em" }}>{s.monogram}</span>
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-black uppercase italic tracking-tight text-white truncate">{s.name}</h2>
                          <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: s.colors[0] + "99" }}>Production Studio</p>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                        className="text-white/20 shrink-0 ml-2">
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                    <p className="text-[10px] text-white/25 leading-relaxed pl-[60px]">{s.known}</p>
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
