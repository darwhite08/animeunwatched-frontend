"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Heart, List, User, X, ChevronRight, Plus, Tag, Star,
  Clock, Check,
} from "lucide-react"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"
import AnimeModal from "@/components/bestanimelist/AnimeModal"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Types ── */
interface CommunityList {
  id: string
  title: string
  creator: string
  animeCount: number
  description: string
  coverAnimeIds: string[]
  likes: number
  tags: string[]
}

/* ── Mock data ── */
const COMMUNITY_LISTS: CommunityList[] = [
  {
    id: "top-50-psychological",
    title: "My Top 50 Psychological Anime of All Time",
    creator: "Otaku_Arch",
    animeCount: 42,
    description:
      "A curated deep-dive into anime that rewires your brain. Every entry is chosen for its narrative complexity, unreliable narrators, or philosophy. Not for the faint of heart.",
    coverAnimeIds: ["monster", "steins-gate", "neon-genesis-evangelion", "death-note"],
    likes: 312,
    tags: ["Psychological", "Must Watch", "Mind-Bending", "Dark"],
  },
  {
    id: "madhouse-archive",
    title: "Complete Madhouse Studio Archive",
    creator: "ShadowWatcher",
    animeCount: 28,
    description:
      "Every significant production from Madhouse in chronological order. From Monster to Frieren — the definitive studio retrospective for animation enthusiasts.",
    coverAnimeIds: ["hunter-x-hunter-2011", "monster", "death-note", "frieren"],
    likes: 187,
    tags: ["Madhouse", "Studio Archive", "Historical", "Animation"],
  },
  {
    id: "emotionally-destroy-you",
    title: "Anime That Will Destroy You Emotionally",
    creator: "NeuralBot_X",
    animeCount: 15,
    description:
      "These are not recommendations. They are warnings. Each entry is a calculated attack on your emotional stability. You have been told.",
    coverAnimeIds: ["violet-evergarden", "your-lie-in-april", "vinland-saga", "steins-gate"],
    likes: 892,
    tags: ["Emotional", "Tragic", "Cathartic", "Cry Warning"],
  },
  {
    id: "best-per-year",
    title: "Best Anime of Each Year 2000–2024",
    creator: "VoidSeeker",
    animeCount: 24,
    description:
      "One standout per year from 2000 to 2024. Criteria: cultural impact, animation quality, storytelling innovation, and rewatchability. Updated annually.",
    coverAnimeIds: ["cowboy-bebop", "attack-on-titan", "fullmetal-alchemist-brotherhood", "frieren"],
    likes: 234,
    tags: ["Annual", "Historical", "Best Of", "Definitive"],
  },
  {
    id: "hidden-mappa",
    title: "Hidden MAPPA Masterpieces",
    creator: "CipherRonin",
    animeCount: 8,
    description:
      "Everyone knows Attack on Titan Final and Jujutsu Kaisen. These are the MAPPA productions flying under the radar — each one deserving far more conversation.",
    coverAnimeIds: ["vinland-saga", "chainsaw-man", "attack-on-titan", "jujutsu-kaisen"],
    likes: 156,
    tags: ["MAPPA", "Underrated", "Hidden Gems", "Studio"],
  },
  {
    id: "perfect-first-anime",
    title: "Perfect First Anime for Newcomers",
    creator: "AlphaWatcher",
    animeCount: 10,
    description:
      "Carefully selected to avoid alienating newcomers while still delivering the full power of what anime can be. Every entry is accessible, self-contained, and unforgettable.",
    coverAnimeIds: ["fullmetal-alchemist-brotherhood", "demon-slayer", "spy-x-family", "one-punch-man"],
    likes: 421,
    tags: ["Beginner Friendly", "Gateway Anime", "Accessible", "Essentials"],
  },
]

/* ── Cover grid ── */
function ListCoverGrid({ ids, allAnime }: { ids: string[]; allAnime: Anime[] }) {
  const covers = ids
    .map(id => allAnime.find(a => a.id === id))
    .filter((a): a is Anime => !!a)
    .slice(0, 4)

  return (
    <div className="grid grid-cols-2 gap-1 aspect-square rounded-2xl overflow-hidden">
      {covers.map(anime => (
        <div key={anime.id} className="relative w-full h-full">
          <Image
            src={anime.image}
            alt={anime.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      ))}
      {/* Fill empty slots */}
      {Array.from({ length: Math.max(0, 4 - covers.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-white/5" />
      ))}
    </div>
  )
}

/* ── List card ── */
interface ListCardProps {
  list: CommunityList
  onClick: (list: CommunityList) => void
  allAnime: Anime[]
}

function ListCard({ list, onClick, allAnime }: ListCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => onClick(list)}
      className="group cursor-pointer p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/20 transition-all duration-300 space-y-4 hover:bg-white/[0.03]"
    >
      <div className="flex gap-4">
        {/* Cover grid */}
        <div className="w-20 h-20 shrink-0">
          <ListCoverGrid ids={list.coverAnimeIds} allAnime={allAnime} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {list.title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-white/35">
            <User size={10} />
            <span className="font-bold">{list.creator}</span>
            <span className="text-white/15">·</span>
            <List size={10} />
            <span>{list.animeCount} anime</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{list.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {list.tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/8 border border-indigo-500/15 text-[8px] font-black uppercase tracking-wider text-indigo-400/70"
          >
            <Tag size={7} />
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <button className="flex items-center gap-1.5 text-[10px] font-black text-white/25 hover:text-rose-400 transition-colors">
          <Heart size={11} /> {list.likes.toLocaleString()}
        </button>
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400/50 group-hover:text-indigo-400 transition-colors">
          View List <ChevronRight size={11} />
        </span>
      </div>
    </motion.div>
  )
}

/* ── List detail modal ── */
interface ListModalProps {
  list: CommunityList | null
  onClose: () => void
  onAnimeClick: (anime: Anime) => void
  allAnime: Anime[]
}

function ListDetailModal({ list, onClose, onAnimeClick, allAnime }: ListModalProps) {
  if (!list) return null

  const animes = list.coverAnimeIds
    .map(id => allAnime.find(a => a.id === id))
    .filter((a): a is Anime => !!a)

  // Fill up with extra matches if fewer than animeCount
  const extraAnimes = allAnime.filter(a => !list.coverAnimeIds.includes(a.id))
    .slice(0, Math.max(0, list.animeCount - animes.length))

  const allAnimes = [...animes, ...extraAnimes]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="relative w-full max-w-3xl bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(79,70,229,0.18)] max-h-[85vh] flex flex-col"
        >
          {/* Modal header */}
          <div className="p-8 border-b border-white/5 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">
              Community List
            </p>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight mb-3 pr-10">
              {list.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
              <span className="flex items-center gap-1.5">
                <User size={11} /> {list.creator}
              </span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1.5">
                <List size={11} /> {list.animeCount} anime
              </span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1.5">
                <Heart size={11} /> {list.likes.toLocaleString()} likes
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{list.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {list.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-indigo-500/8 border border-indigo-500/15 text-[8px] font-black uppercase tracking-wider text-indigo-400/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Anime entries */}
          <div className="overflow-y-auto flex-1 p-6 space-y-3">
            {allAnimes.map((anime, i) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onAnimeClick(anime)}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 cursor-pointer transition-colors group"
              >
                <span className="text-[10px] font-black text-white/20 w-5 text-right shrink-0">
                  {i + 1}
                </span>
                <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                  <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="36px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase italic text-white/80 group-hover:text-white transition-colors truncate">
                    {anime.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-white/30">
                    <Star size={9} fill="#f59e0b" className="text-amber-400" />
                    <span>{anime.rating.toFixed(1)}</span>
                    <span className="text-white/15">·</span>
                    <span>{anime.studio}</span>
                    <span className="text-white/15">·</span>
                    <span>{anime.year}</span>
                  </div>
                </div>
                <Check size={13} className="text-indigo-400/40 group-hover:text-indigo-400 shrink-0 transition-colors" />
              </motion.div>
            ))}

            {allAnimes.length < list.animeCount && (
              <p className="text-center text-[10px] text-white/20 py-4 font-black uppercase tracking-widest">
                + {list.animeCount - allAnimes.length} more not shown
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/* ── Page ── */
export default function PublicListsPage() {
  const [openList, setOpenList] = useState<CommunityList | null>(null)
  const [openAnime, setOpenAnime] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 20 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)

  const handleAnimeClick = (anime: Anime) => {
    setOpenAnime(anime)
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <List size={16} className="text-indigo-400" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60">
            Curated by the Community
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
              Community Lists<span style={{color:"#f59e0b"}}>.</span>
            </h1>
            <p className="text-white/35 text-sm">{COMMUNITY_LISTS.length} curated lists from the archive community</p>
          </div>
          <Link
            href="/creators"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_0_24px_rgba(99,102,241,0.3)] shrink-0 self-start sm:self-auto"
          >
            <Plus size={13} /> Create a List
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {COMMUNITY_LISTS.map(list => (
          <ListCard key={list.id} list={list} onClick={setOpenList} allAnime={allAnime} />
        ))}
      </div>

      {/* List detail modal */}
      {openList && !openAnime && (
        <ListDetailModal
          list={openList}
          onClose={() => setOpenList(null)}
          onAnimeClick={handleAnimeClick}
          allAnime={allAnime}
        />
      )}

      {/* Anime modal — shown on top of list modal */}
      <AnimeModal
        isOpen={openAnime !== null}
        onClose={() => setOpenAnime(null)}
        anime={openAnime}
      />
    </div>
  )
}
