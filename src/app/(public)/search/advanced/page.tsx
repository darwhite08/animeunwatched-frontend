"use client"

import { useState, useMemo, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, SlidersHorizontal, Star, X, Check,
  BookOpen, Users, FileText, Shield, MessageSquare, Save,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ANIME_DB, type Anime } from "@/lib/data/anime"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type SearchType = "anime" | "users" | "posts" | "clubs" | "blogs" | "reviews"

type AnimeFilters = {
  title: string
  genres: string[]
  yearMin: string
  yearMax: string
  ratingMin: string
  type: string
  status: string
}

/* ── Constants ── */
const SEARCH_TYPES: { id: SearchType; label: string; icon: typeof Search }[] = [
  { id: "anime",   label: "Anime",   icon: Star },
  { id: "users",   label: "Users",   icon: Users },
  { id: "posts",   label: "Posts",   icon: FileText },
  { id: "clubs",   label: "Clubs",   icon: Shield },
  { id: "blogs",   label: "Blogs",   icon: BookOpen },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
]

const ALL_GENRES = [
  "Action", "Comedy", "Fantasy", "Sci-Fi", "Thriller",
  "Psychological", "Romance", "Horror", "Shonen", "Seinen", "Historical",
]

const ANIME_TYPES = ["", "TV", "Movie", "OVA"]
const ANIME_STATUSES = ["", "finished", "airing"]

/* ── Mock results for non-anime types ── */
const MOCK_USERS = [
  { id: "u1", name: "Otaku_Arch",    bio: "Legendary Shinobi · Level 99",      count: 312  },
  { id: "u2", name: "ShadowWatcher", bio: "Arch-Mage · Psychological fanatic",  count: 208  },
  { id: "u3", name: "NeuralBot_X",   bio: "Elite Jonin · Shonen completionist", count: 145  },
  { id: "u4", name: "VoidSeeker",    bio: "Wanderer · Seinen purist",           count: 97   },
]

const MOCK_POSTS = [
  { id: "p1", title: "Why Frieren is the anime of the decade",          author: "Otaku_Arch",    likes: 412, time: "2h ago" },
  { id: "p2", title: "Gojo's Infinity — a physics breakdown",           author: "ShadowWatcher", likes: 284, time: "4h ago" },
  { id: "p3", title: "Top 10 underrated gems of 2024",                  author: "NeuralBot_X",   likes: 196, time: "6h ago" },
  { id: "p4", title: "Chainsaw Man Season 2 — what did it change?",     author: "VoidSeeker",    likes: 157, time: "1d ago" },
]

const MOCK_CLUBS = [
  { id: "c1", name: "Psychological Thriller Club", members: 2341, desc: "For fans of Monster, Lain, Eva and the dark stuff."  },
  { id: "c2", name: "Shonen Warriors",             members: 5812, desc: "Discuss the biggest shonen titles past and present."  },
  { id: "c3", name: "Hidden Gems Collective",      members: 893,  desc: "Surface forgotten masterpieces."                    },
  { id: "c4", name: "Seasonal Watchers",           members: 4107, desc: "Follow every new season together."                  },
]

const MOCK_BLOGS = [
  { id: "b1", title: "The Philosophy of Neon Genesis Evangelion",       author: "Otaku_Arch",    reads: 9831 },
  { id: "b2", title: "How Vinland Saga Redefined the Revenge Arc",      author: "ShadowWatcher", reads: 6104 },
  { id: "b3", title: "Monster: A Case Study in Pacing",                 author: "NeuralBot_X",   reads: 4370 },
]

const MOCK_REVIEWS = [
  { id: "r1", anime: "Fullmetal Alchemist: Brotherhood", author: "Otaku_Arch",    rating: 9.5, preview: "A near-perfect execution of a sprawling fantasy epic…"    },
  { id: "r2", anime: "Steins;Gate",                      author: "VoidSeeker",    rating: 9.0, preview: "The slow build is a feature, not a bug…"                   },
  { id: "r3", anime: "Monster",                          author: "NeuralBot_X",   rating: 9.2, preview: "74 episodes and not a single wasted scene…"                },
]

/* ── Genre chip ── */
function GenreChip({
  genre,
  selected,
  onToggle,
}: {
  genre: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
        selected
          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
          : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
      }`}
    >
      {selected && <Check size={8} className="inline mr-1" />}
      {genre}
    </button>
  )
}

/* ── Anime result card ── */
function AnimeResultCard({
  anime,
  index,
  onClick,
}: {
  anime: Anime
  index: number
  onClick: (a: Anime) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick(anime)}
      className="group relative aspect-[2/3] cursor-pointer"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/0 to-indigo-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative h-full w-full rounded-[1.4rem] overflow-hidden border border-white/5 group-hover:border-white/15 transition-colors">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 scale-105 group-hover:scale-100"
          sizes="200px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
          <p className="text-xs font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
            {anime.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={10} fill="#f59e0b" className="text-amber-400" />
            <span className="text-[10px] font-black text-white/70">{anime.rating.toFixed(1)}</span>
            <span className="text-[9px] text-white/30">{anime.year}</span>
            <span className="text-[9px] text-white/30">{anime.type}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Select field ── */
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white outline-none focus:border-indigo-500/40 transition-colors appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ── Input field ── */
function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 transition-colors"
      />
    </div>
  )
}

/* ── Main content ── */
function AdvancedSearchContent() {
  const { push } = useToast()

  const [searchType, setSearchType] = useState<SearchType>("anime")
  const [animeFilters, setAnimeFilters] = useState<AnimeFilters>({
    title:     "",
    genres:    [],
    yearMin:   "",
    yearMax:   "",
    ratingMin: "",
    type:      "",
    status:    "",
  })
  const [modal, setModal] = useState<Anime | null>(null)

  const updateAnime = (key: keyof AnimeFilters, value: string | string[]) =>
    setAnimeFilters((f) => ({ ...f, [key]: value }))

  const toggleGenre = (genre: string) => {
    const already = animeFilters.genres.includes(genre)
    updateAnime("genres", already
      ? animeFilters.genres.filter((g) => g !== genre)
      : [...animeFilters.genres, genre]
    )
  }

  const clearFilters = () =>
    setAnimeFilters({ title: "", genres: [], yearMin: "", yearMax: "", ratingMin: "", type: "", status: "" })

  const animeResults = useMemo(() => {
    return ANIME_DB.filter((a) => {
      if (animeFilters.title && !a.title.toLowerCase().includes(animeFilters.title.toLowerCase())) return false
      if (animeFilters.genres.length > 0 && !animeFilters.genres.every((g) => a.genres.includes(g))) return false
      if (animeFilters.yearMin && a.year < Number(animeFilters.yearMin)) return false
      if (animeFilters.yearMax && a.year > Number(animeFilters.yearMax)) return false
      if (animeFilters.ratingMin && a.rating < Number(animeFilters.ratingMin)) return false
      if (animeFilters.type && a.type !== animeFilters.type) return false
      if (animeFilters.status && a.status !== animeFilters.status) return false
      return true
    }).sort((a, b) => b.rating - a.rating)
  }, [animeFilters])

  const handleSaveSearch = () => {
    push("Search saved to your profile!", "success")
  }

  const hasActiveFilters =
    animeFilters.title ||
    animeFilters.genres.length > 0 ||
    animeFilters.yearMin ||
    animeFilters.yearMax ||
    animeFilters.ratingMin ||
    animeFilters.type ||
    animeFilters.status

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-32">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-3">
          Neural Archive
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
            Advanced<br />
            <span className="text-indigo-400">Search</span>
            <span className="text-indigo-500">.</span>
          </h1>
          <Link
            href="/search"
            className="text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors mb-2"
          >
            ← Basic Search
          </Link>
        </div>
        <p className="text-white/35 text-sm mt-2">Filter across the entire anime catalog with precision.</p>
      </motion.div>

      {/* Search type selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        {SEARCH_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSearchType(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
              searchType === id
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-white/[0.02] border-white/8 text-white/40 hover:border-white/20 hover:text-white/70"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Filter panel (Anime only) */}
      <AnimatePresence mode="wait">
        {searchType === "anime" && (
          <motion.div
            key="anime-filters"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 mb-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-indigo-400" />
                <p className="text-sm font-black uppercase italic tracking-tighter text-white">Filters</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={11} /> Clear All
                </button>
              )}
            </div>

            {/* Title */}
            <InputField
              label="Title"
              value={animeFilters.title}
              placeholder="e.g. Fullmetal, Death Note…"
              onChange={(v) => updateAnime("title", v)}
            />

            {/* Genre multi-select */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                Genres
                {animeFilters.genres.length > 0 && (
                  <span className="ml-2 text-indigo-400">{animeFilters.genres.length} selected</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => (
                  <GenreChip
                    key={g}
                    genre={g}
                    selected={animeFilters.genres.includes(g)}
                    onToggle={() => toggleGenre(g)}
                  />
                ))}
              </div>
            </div>

            {/* Year range, Rating, Type, Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InputField
                label="Year From"
                value={animeFilters.yearMin}
                placeholder="1990"
                onChange={(v) => updateAnime("yearMin", v)}
              />
              <InputField
                label="Year To"
                value={animeFilters.yearMax}
                placeholder="2026"
                onChange={(v) => updateAnime("yearMax", v)}
              />
              <InputField
                label="Min Rating"
                value={animeFilters.ratingMin}
                placeholder="8.0"
                onChange={(v) => updateAnime("ratingMin", v)}
              />
              <SelectField
                label="Type"
                value={animeFilters.type}
                onChange={(v) => updateAnime("type", v)}
                options={[
                  { value: "",       label: "Any Type" },
                  { value: "TV",     label: "TV Series" },
                  { value: "Movie",  label: "Movie" },
                  { value: "OVA",    label: "OVA" },
                ]}
              />
            </div>

            <SelectField
              label="Status"
              value={animeFilters.status}
              onChange={(v) => updateAnime("status", v)}
              options={[
                { value: "",         label: "Any Status" },
                { value: "finished", label: "Finished" },
                { value: "airing",   label: "Currently Airing" },
              ]}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <div className="text-xs text-white/30">
                <span className="font-black text-white">{animeResults.length}</span> results
              </div>
              <button
                onClick={handleSaveSearch}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
              >
                <Save size={13} /> Save Search
              </button>
            </div>
          </motion.div>
        )}

        {/* Other type filter panels (simplified) */}
        {searchType !== "anime" && (
          <motion.div
            key="other-filters"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <SlidersHorizontal size={15} className="text-indigo-400" />
              <p className="text-sm font-black uppercase italic tracking-tighter text-white">
                {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Filters
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Keyword"
                value=""
                placeholder={`Search ${searchType}…`}
                onChange={() => {}}
              />
              <div className="flex items-end">
                <button
                  onClick={handleSaveSearch}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/25 text-xs font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600/25 transition-all"
                >
                  <Save size={13} /> Save Search
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">

        {/* Anime results */}
        {searchType === "anime" && (
          <motion.div key="anime-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {animeResults.length > 0 ? (
              <>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-5">
                  {animeResults.length} anime found
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {animeResults.map((anime, i) => (
                    <AnimeResultCard key={anime.id} anime={anime} index={i} onClick={setModal} />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
                <Search size={28} className="mx-auto mb-3 text-white/15" />
                <p className="text-white/25 text-sm font-black uppercase tracking-widest">No anime matched your filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear Filters →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Users */}
        {searchType === "users" && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {MOCK_USERS.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-black shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-black text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                  <p className="text-xs text-white/35 mt-0.5">{u.bio}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{u.count}</p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Archived</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Posts */}
        {searchType === "posts" && (
          <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {MOCK_POSTS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all cursor-pointer"
              >
                <p className="font-bold text-white/80 hover:text-white transition-colors">{p.title}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                  <span>{p.author}</span>
                  <span>{p.time}</span>
                  <span>{p.likes} likes</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Clubs */}
        {searchType === "clubs" && (
          <motion.div key="clubs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {MOCK_CLUBS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-black text-white">{c.name}</p>
                  <span className="text-[10px] font-black text-indigo-400 shrink-0">{c.members.toLocaleString()} members</span>
                </div>
                <p className="text-xs text-white/40 leading-snug">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Blogs */}
        {searchType === "blogs" && (
          <motion.div key="blogs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {MOCK_BLOGS.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all cursor-pointer"
              >
                <p className="font-black text-white/90">{b.title}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                  <span>{b.author}</span>
                  <span>{b.reads.toLocaleString()} reads</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Reviews */}
        {searchType === "reviews" && (
          <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {MOCK_REVIEWS.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-0.5">{r.anime}</p>
                    <p className="text-sm text-white/70 italic line-clamp-2">{r.preview}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={12} fill="#f59e0b" className="text-amber-400" />
                    <span className="font-black text-white">{r.rating}</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/25">by {r.author}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimeModal isOpen={modal !== null} onClose={() => setModal(null)} anime={modal} />
    </div>
  )
}

/* ── Page export ── */
export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020202]" />}>
      <div className="min-h-screen bg-[#020202] text-white">
        <AdvancedSearchContent />
      </div>
    </Suspense>
  )
}
