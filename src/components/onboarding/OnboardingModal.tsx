"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookCheck,
  Flame,
  Brain,
  Zap,
  Check,
  Star,
  ArrowRight,
  X,
} from "lucide-react"
import Image from "next/image"
import type { Anime } from "@/lib/data/anime"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as "TV"|"Movie"|"OVA" : "TV" as const, status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all" as const, rank: i+1 }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WatcherType {
  id: string
  label: string
  description: string
  icon: React.ReactNode
}

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
}

// ─── Data ────────────────────────────────────────────────────────────────────

const WATCHER_TYPES: WatcherType[] = [
  {
    id: "completionist",
    label: "The Completionist",
    description: "Every arc. Every filler. Every frame. You watch it all to the bitter end.",
    icon: <BookCheck className="w-8 h-8" />,
  },
  {
    id: "mood-watcher",
    label: "The Mood Watcher",
    description: "Vibes over hype. You pick based on the feeling you need right now.",
    icon: <Flame className="w-8 h-8" />,
  },
  {
    id: "intellectual",
    label: "The Intellectual",
    description: "Seinen. Psychological. Philosophy disguised as animation.",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    id: "hype-machine",
    label: "The Hype Machine",
    description: "Seasonal watcher. If it's trending, you're already two episodes in.",
    icon: <Zap className="w-8 h-8" />,
  },
]

const GENRE_OPTIONS = [
  "Action",
  "Psychological",
  "Seinen",
  "Shonen",
  "Romance",
  "Fantasy",
  "Sci-Fi",
  "Horror",
]

// ─── Step slide variants ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
}

const transition = { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const }

// ─── Step 1: Identity ────────────────────────────────────────────────────────

function StepIdentity({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-black uppercase text-3xl tracking-tight text-foreground leading-tight">
          What kind of watcher<br />are you?
        </h2>
        <p className="text-zinc-400 text-sm mt-2">
          Your identity shapes your archive. Choose wisely.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WATCHER_TYPES.map((wt) => {
          const isSelected = selected === wt.id
          return (
            <button
              key={wt.id}
              onClick={() => onSelect(wt.id)}
              className={[
                "relative text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer group",
                isSelected
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_color-mix(in srgb, var(--app-accent) 25%, transparent)]"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-3 transition-colors duration-200",
                  isSelected ? "text-accent-bright" : "text-zinc-400 group-hover:text-zinc-300",
                ].join(" ")}
              >
                {wt.icon}
              </div>
              <p
                className={[
                  "font-bold text-sm uppercase tracking-wide transition-colors",
                  isSelected ? "text-accent-bright" : "text-foreground",
                ].join(" ")}
              >
                {wt.label}
              </p>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                {wt.description}
              </p>
              {isSelected && (
                <motion.div
                  layoutId="watcher-check"
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
                >
                  <Check className="w-3 h-3 text-foreground" />
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: Pick Anime ───────────────────────────────────────────────────────

function StepPickAnime({
  selectedIds,
  onToggle,
  animeList,
}: {
  selectedIds: Set<string>
  onToggle: (id: string, anime: Anime) => void
  animeList: Anime[]
}) {
  const count = selectedIds.size
  const min = 5

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-black uppercase text-3xl tracking-tight text-foreground leading-tight">
          Pick your first 5 anime
        </h2>
        <p className="text-zinc-400 text-sm mt-2">
          Your list is your personality. Start strong.
        </p>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2">
        <div
          className={[
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors",
            count >= min
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700",
          ].join(" ")}
        >
          {count}/{min} selected
        </div>
        {count >= min && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-emerald-400"
          >
            Looking solid.
          </motion.span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {animeList.map((anime) => {
          const isSelected = selectedIds.has(anime.id)
          return (
            <button
              key={anime.id}
              onClick={() => onToggle(anime.id, anime)}
              className="relative rounded-xl overflow-hidden aspect-[2/3] group cursor-pointer focus:outline-none"
            >
              <Image
                src={anime.image}
                alt={anime.title}
                fill
                className={[
                  "object-cover transition-all duration-200",
                  isSelected ? "brightness-50" : "brightness-75 group-hover:brightness-90",
                ].join(" ")}
                sizes="(max-width: 640px) 33vw, 25vw"
              />
              {/* Title overlay */}
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-[10px] font-bold text-foreground leading-tight line-clamp-2">
                  {anime.title}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Star className="w-2.5 h-2.5 text-accent-bright fill-amber-400" />
                  <span className="text-[9px] text-accent-bright">{anime.rating}</span>
                </div>
              </div>
              {/* Selected overlay */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-foreground" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Border */}
              <div
                className={[
                  "absolute inset-0 rounded-xl border-2 transition-colors pointer-events-none",
                  isSelected ? "border-emerald-500" : "border-transparent",
                ].join(" ")}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: Genres ───────────────────────────────────────────────────────────

function StepGenres({
  selected,
  onToggle,
}: {
  selected: Set<string>
  onToggle: (genre: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-black uppercase text-3xl tracking-tight text-foreground leading-tight">
          What keeps you up<br />at night?
        </h2>
        <p className="text-zinc-400 text-sm mt-2">
          Pick at least 2 genres. We use this to sharpen your archive.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {GENRE_OPTIONS.map((genre) => {
          const isSelected = selected.has(genre)
          return (
            <button
              key={genre}
              onClick={() => onToggle(genre)}
              className={[
                "px-5 py-2.5 rounded-full border font-bold uppercase text-sm tracking-wide transition-all duration-200 cursor-pointer",
                isSelected
                  ? "border-accent bg-accent/20 text-accent-bright shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                  : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              {genre}
            </button>
          )
        })}
      </div>

      {selected.size >= 2 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-accent-bright"
        >
          {selected.size} genre{selected.size > 1 ? "s" : ""} selected — taste confirmed.
        </motion.p>
      )}
    </div>
  )
}

// ─── Step 4: Ready ────────────────────────────────────────────────────────────

function StepReady({
  selectedAnime,
  watcherTypeId,
  onEnter,
}: {
  selectedAnime: Anime[]
  watcherTypeId: string | null
  onEnter: () => void
}) {
  const watcherLabel =
    WATCHER_TYPES.find((w) => w.id === watcherTypeId)?.label ?? "Shinobi"

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div>
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-accent-bright text-sm font-bold uppercase tracking-widest mb-2"
        >
          Identity unlocked
        </motion.p>
        <h2 className="font-black uppercase text-3xl tracking-tight text-foreground leading-tight">
          Welcome to the Dojo,<br />Shinobi.
        </h2>
      </div>

      {/* Watcher type badge */}
      {watcherTypeId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/40 bg-violet-500/10"
        >
          <span className="text-violet-300 text-xs font-bold uppercase tracking-widest">
            {watcherLabel}
          </span>
        </motion.div>
      )}

      {/* Mini anime grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-5 gap-2 w-full"
      >
        {selectedAnime.slice(0, 5).map((anime, i) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="relative rounded-xl overflow-hidden aspect-[2/3]"
          >
            <Image
              src={anime.image}
              alt={anime.title}
              fill
              className="object-cover"
              sizes="20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <p className="absolute bottom-1 inset-x-1 text-[8px] font-bold text-foreground text-center leading-tight line-clamp-2">
              {anime.title}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Enter button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onEnter}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-black font-black uppercase tracking-widest text-sm transition-all duration-200"
        style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 0 30px color-mix(in srgb, var(--app-accent) 40%, transparent)" }}
      >
        Enter the Archive
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === current ? 24 : 6,
            backgroundColor: i + 1 === current ? "#6366f1" : i + 1 < current ? "#4f46e5" : "#3f3f46",
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [watcherType, setWatcherType] = useState<string | null>(null)
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<Set<string>>(new Set())
  const [selectedAnimeMap, setSelectedAnimeMap] = useState<Map<string, Anime>>(new Map())
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set())

  const addToWatchlist = useWatchlist((s) => s.add)
  const toast = useToast((s) => s.push)
  const { data: browseData } = useBrowseAnime({ limit: 50 })
  const ONBOARDING_ANIME = [...(browseData?.data ?? [])]
    .map(mapDTO)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 12)

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const totalSteps = 4

  const canProceed = () => {
    if (step === 1) return watcherType !== null
    if (step === 2) return selectedAnimeIds.size >= 5
    if (step === 3) return selectedGenres.size >= 2
    return true
  }

  const goNext = () => {
    if (!canProceed()) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const toggleAnime = (id: string, anime: Anime) => {
    setSelectedAnimeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setSelectedAnimeMap((prev) => {
      const next = new Map(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.set(id, anime)
      }
      return next
    })
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev)
      if (next.has(genre)) {
        next.delete(genre)
      } else {
        next.add(genre)
      }
      return next
    })
  }

  const handleEnter = () => {
    // Add all selected anime to watchlist
    selectedAnimeMap.forEach((anime) => {
      addToWatchlist(anime)
    })
    // Mark onboarding complete so this user never sees it again
    if (typeof window !== "undefined") {
      localStorage.setItem("aw_onboarded", "1")
    }
    toast("Archive initialized! Your watch begins now.", "success")
    onComplete()
  }

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aw_onboarded", "1")
    }
    onComplete()
  }

  const selectedAnimeList = Array.from(selectedAnimeMap.values())

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999, backgroundColor: "rgba(0,0,0,0.96)", backdropFilter: "blur(20px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-lg bg-surface border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800/60">
              <ProgressDots current={step} total={totalSteps} />
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 text-xs font-mono">
                  {step}/{totalSteps}
                </span>
                {step < 4 && (
                  <button
                    onClick={handleSkip}
                    className="text-zinc-500 hover:text-zinc-300 text-xs uppercase tracking-widest font-bold transition-colors"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>

            {/* Step content with slide animation */}
            <div className="px-6 py-6 min-h-[420px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  {step === 1 && (
                    <StepIdentity
                      selected={watcherType}
                      onSelect={setWatcherType}
                    />
                  )}
                  {step === 2 && (
                    <StepPickAnime
                      selectedIds={selectedAnimeIds}
                      onToggle={toggleAnime}
                      animeList={ONBOARDING_ANIME}
                    />
                  )}
                  {step === 3 && (
                    <StepGenres
                      selected={selectedGenres}
                      onToggle={toggleGenre}
                    />
                  )}
                  {step === 4 && (
                    <StepReady
                      selectedAnime={selectedAnimeList}
                      watcherTypeId={watcherType}
                      onEnter={handleEnter}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer nav (not shown on step 4) */}
            {step < 4 && (
              <div className="flex items-center justify-between px-6 pb-6 pt-2">
                <button
                  onClick={goBack}
                  disabled={step === 1}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-bold uppercase tracking-wide disabled:opacity-30 hover:border-zinc-500 hover:text-zinc-300 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className={[
                    "flex items-center gap-2 px-5 py-2 rounded-xl font-black uppercase tracking-wide text-sm transition-all duration-200",
                    canProceed()
                      ? "bg-accent hover:bg-accent-bright text-black shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed",
                  ].join(" ")}
                >
                  {step === 3 ? "Almost there" : "Next"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
