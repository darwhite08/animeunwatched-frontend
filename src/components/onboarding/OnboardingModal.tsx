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
  Bell,
  Sparkles,
  X,
} from "lucide-react"
import Image from "next/image"
import type { Anime } from "@/lib/data/anime"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { track } from "@/lib/analytics/ga"
import * as ep from "@/lib/api/endpoints"

type EndowedPick = { malId: number | null; title: string; imageUrl: string | null }

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
        <p className="text-muted text-sm mt-2">
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
                  : "border-border bg-surface-2 hover:border-border",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-3 transition-colors duration-200",
                  isSelected ? "text-accent-bright" : "text-muted group-hover:text-muted",
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
              <p className="text-muted text-xs mt-1 leading-relaxed">
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
        <p className="text-muted text-sm mt-2">
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
              : "bg-surface-2 text-muted border border-border",
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
                  <Star className="w-2.5 h-2.5 text-accent-bright fill-accent-bright" />
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
        <p className="text-muted text-sm mt-2">
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
                  : "border-border bg-surface-2 text-muted hover:border-border hover:text-muted",
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
  endowed,
  genres,
  onEnter,
}: {
  selectedAnime: Anime[]
  watcherTypeId: string | null
  endowed: EndowedPick[]
  genres: string[]
  onEnter: () => void
}) {
  const watcherLabel =
    WATCHER_TYPES.find((w) => w.id === watcherTypeId)?.label ?? "Shinobi"
  const { permission, isSupported, requestPermission, subscribing } = usePushNotifications()

  // Endowed-progress framing: starter archive of 10, already partly filled.
  const GOAL = 10
  const have = Math.min(GOAL, selectedAnime.length + endowed.length)
  const genreLabel = genres.slice(0, 2).join(" & ") || "your taste"

  return (
    <div className="flex flex-col gap-5 items-center text-center">
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

      {/* Starter-archive endowed progress — head start with a STATED REASON */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full p-4 rounded-2xl border border-border bg-surface-2 text-left space-y-3"
      >
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle">Starter Archive</span>
          <span className="text-xs font-black text-foreground">{have} <span className="text-subtle font-bold">of {GOAL} started</span></span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(have / GOAL) * 100}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--app-accent), var(--app-accent-bright))" }}
          />
        </div>
        {endowed.length > 0 && (
          <p className="text-[11px] leading-relaxed text-muted">
            <Sparkles size={11} className="inline -mt-0.5 mr-1 text-accent-bright" />
            Head start: because you picked <strong className="text-foreground">{genreLabel}</strong>, we
            pre-added <strong className="text-foreground">{endowed.map(e => e.title).join(" and ")}</strong> to
            your archive — {GOAL - have} more and your starter set is complete.
          </p>
        )}
      </motion.div>

      {/* Mini anime grid — picks + endowed (endowed marked) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-5 gap-2 w-full"
      >
        {[
          ...selectedAnime.slice(0, Math.max(0, 5 - endowed.length)).map(a => ({ key: a.id, title: a.title, image: a.image, gifted: false })),
          ...endowed.slice(0, 2).map(e => ({ key: `e-${e.malId}`, title: e.title, image: e.imageUrl ?? "", gifted: true })),
        ].map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            className="relative rounded-xl overflow-hidden aspect-[2/3] border border-border"
          >
            {item.image ? (
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="20vw" />
            ) : (
              <div className="absolute inset-0 bg-surface-2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {item.gifted && (
              <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-wider text-black"
                style={{ background: "var(--app-accent-bright)" }}>
                + For you
              </span>
            )}
            <p className="absolute bottom-1 inset-x-1 text-[8px] font-bold text-foreground text-center leading-tight line-clamp-2">
              {item.title}
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

      {/* Contextual push opt-in — earned AFTER the first value moment (populated
          archive), never on first launch. Relevant trigger framing only. */}
      {isSupported && permission === "default" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          onClick={() => { track("push_optin_prompted", { context: "onboarding" }); void requestPermission() }}
          disabled={subscribing}
          className="flex items-center gap-2 text-[11px] font-bold text-muted hover:text-foreground transition-colors"
        >
          <Bell size={12} />
          {subscribing ? "Enabling…" : "Alert me when my anime drop new episodes"}
        </motion.button>
      )}
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
  const [endowed, setEndowed] = useState<EndowedPick[]>([])

  const me = useAuthStore((s) => s.user)
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

  // Persist onboarding to the real API. Selected anime become real list
  // entries (this is what makes the streak tick + first-add badge fire), and
  // completeOnboarding returns the endowed-progress starter picks.
  const persistOnboarding = async () => {
    if (!me) return // not signed in (shouldn't happen on this route) — local-only fallback
    try {
      await Promise.allSettled(
        Array.from(selectedAnimeMap.keys()).map((malId) =>
          ep.upsertListEntry(malId, { status: "PLAN_TO_WATCH" })
        )
      )
      const res = await ep.completeOnboarding(Array.from(selectedGenres))
      if (res.endowed?.length) {
        setEndowed(res.endowed)
        track("endowed_progress_shown", { count: res.endowed.length })
      }
    } catch {
      // Onboarding still completes with local state — endowment is best-effort.
    }
  }

  const goNext = () => {
    if (!canProceed()) return
    setDirection(1)
    if (step === 3) void persistOnboarding() // fire as we transition to the Ready step
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
    // Mirror selections into the local store for instant UI (server already has them)
    selectedAnimeMap.forEach((anime) => {
      addToWatchlist(anime)
    })
    // Mark onboarding complete so this user never sees it again
    if (typeof window !== "undefined") {
      localStorage.setItem("aw_onboarded", "1")
    }
    track("onboarding_completed", {
      selected: selectedAnimeIds.size,
      genres: selectedGenres.size,
      endowed: endowed.length,
    })
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
            className="relative w-full max-w-lg bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <ProgressDots current={step} total={totalSteps} />
              <div className="flex items-center gap-3">
                <span className="text-muted text-xs font-mono">
                  {step}/{totalSteps}
                </span>
                {step < 4 && (
                  <button
                    onClick={handleSkip}
                    className="text-muted hover:text-muted text-xs uppercase tracking-widest font-bold transition-colors"
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
                      endowed={endowed}
                      genres={Array.from(selectedGenres)}
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
                  className="px-4 py-2 rounded-xl border border-border text-muted text-sm font-bold uppercase tracking-wide disabled:opacity-30 hover:border-border hover:text-muted transition-all"
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
                      : "bg-surface-2 text-muted cursor-not-allowed",
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
