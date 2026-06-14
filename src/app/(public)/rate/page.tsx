"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import type { Anime } from "@/lib/data/anime"
import { useToast } from "@/stores/toast.store"
import {
  Star, Search, ShieldCheck, CheckCircle2,
  ChevronRight, RotateCcw, Trophy, Sparkles,
} from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useCreateReview } from "@/hooks/useReviews"
import { useUpsertListEntry } from "@/hooks/useAnime"
import { useAuthStore } from "@/stores/auth.store"
import type { AnimeDTO } from "@/lib/api/types"

const mapDTO = (a: AnimeDTO, i: number): Anime => ({
  id: String(a.malId),
  title: a.title,
  titleJapanese: a.titleJapanese ?? "",
  rating: a.score ?? 0,
  year: a.year ?? 0,
  episodes: a.episodes,
  type: (["TV", "Movie", "OVA"] as const).includes(a.type as any) ? a.type as any : "TV",
  status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
  studio: a.studios[0] ?? "Unknown",
  genres: a.genres,
  synopsis: a.synopsis ?? "",
  image: a.imageUrl ?? "",
  tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
  category: "all",
  rank: i + 1,
})

/* ── Per-anime verification questions ── */
type Q = { id: string; q: string; opts: string[]; correct: string }

const ANIME_QUESTIONS: Record<string, Q[]> = {
  "attack-on-titan": [
    { id:"a1", q:"Which titan breaks Wall Maria in episode 1?",     opts:["Colossal","Armored","Beast","Female"],      correct:"Colossal" },
    { id:"a2", q:"What is in the basement Eren's father mentions?",  opts:["Titans","History","Weapons","Key secrets"], correct:"History"  },
  ],
  "fullmetal-alchemist-brotherhood": [
    { id:"b1", q:"What did Edward and Alphonse try to bring back?",  opts:["Their father","Their mother","A dog","A friend"], correct:"Their mother" },
    { id:"b2", q:"What does the Gate take as Edward's payment?",     opts:["His arm","His leg","His eye","His sight"],       correct:"His arm" },
  ],
  "death-note": [
    { id:"c1", q:"What rule kills anyone whose name is written?",   opts:["Manga","Death Note","Black Book","God's List"], correct:"Death Note" },
    { id:"c2", q:"What is L's favourite food?",                      opts:["Sushi","Ramen","Sweets","Rice"],               correct:"Sweets" },
  ],
  "steins-gate": [
    { id:"d1", q:"What device does Okabe use as a time machine?",   opts:["Phone","Microwave","TV","Laptop"],   correct:"Microwave" },
    { id:"d2", q:"What is the divergence needed for the Steins Gate worldline?", opts:["1.048596","0.999999","1.0","0.571024"], correct:"1.048596" },
  ],
}

const GENERIC_Q = (anime: Anime): Q[] => [
  {
    id:"g1",
    q:`Which studio produced ${anime.title}?`,
    opts: [anime.studio, "Madhouse", "MAPPA", "Bones"].sort(() => Math.random()-0.5),
    correct: anime.studio,
  },
  {
    id:"g2",
    q:`In what year did ${anime.title} premiere?`,
    opts: [String(anime.year), String(anime.year-1), String(anime.year+1), String(anime.year-2)].sort(() => Math.random()-0.5),
    correct: String(anime.year),
  },
]

type Step = "select" | "rate" | "verify" | "result"

/* ── Score label ── */
const credLabel = (n: number) =>
  n === 100 ? "Verified Watcher 🏆" :
  n >= 50   ? "Plausible Fan 👍"  :
  "Questionable 🤔"

export default function RatePage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const { push } = useToast()
  const [step,    setStep]    = useState<Step>("select")
  const [anime,   setAnime]   = useState<Anime | null>(null)
  const [query,   setQuery]   = useState("")
  const [rating,  setRating]  = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [cred,    setCred]    = useState(0)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 20 })
  const animeList = useMemo(() => (browseData?.data ?? []).map(mapDTO), [browseData])

  const filtered = useMemo(() =>
    animeList.filter(a => a.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
  [animeList, query])

  const questions = useMemo((): Q[] => {
    if (!anime) return []
    return ANIME_QUESTIONS[anime.id] ?? GENERIC_Q(anime)
  }, [anime])

  const selectAnime = (a: Anime) => { setAnime(a); setStep("rate"); setQuery("") }

  const submitRating = () => {
    if (!rating) return
    setStep("verify")
  }

  const createReview = useCreateReview()
  const upsert = useUpsertListEntry(anime ? parseInt(anime.id, 10) : 0)

  const submitVerify = async () => {
    const score = (Object.entries(answers).filter(([id, ans]) => {
      const q = questions.find(q => q.id === id)
      return q?.correct === ans
    }).length / Math.max(1, questions.length)) * 100
    setCred(score)
    setStep("result")

    if (isAuthenticated && anime && rating) {
      const malId = parseInt(anime.id, 10)
      // Save to watchlist as completed + score
      upsert.mutate({ status: "COMPLETED", score: rating, episodesSeen: anime.episodes ?? 0 })
      // Save as review
      createReview.mutate({
        animeId: anime.id,
        score: rating,
        body: `Rated ${rating}/10 via the Neural Rate system.`,
        hasSpoilers: false,
      })
    }
    push(`Rating submitted! Credibility: ${score.toFixed(0)}%`, score >= 50 ? "success" : "info")
  }

  const reset = () => {
    setStep("select"); setAnime(null); setRating(null); setAnswers({}); setCred(0)
  }

  if (isLoading) return null

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      {/* Anime hero background */}
      <AnimatePresence>
        {anime && (
          <motion.div
            key={anime.id}
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            className="fixed inset-0 -z-10"
          >
            <Image src={anime.image} alt="" fill className="object-cover brightness-[0.12] blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--app-bg)]/80 via-[var(--app-bg)]/90 to-[var(--app-bg)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-6 pt-32 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity:0, y:-12 }}
            animate={{ opacity:1, y:0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright"
          >
            <ShieldCheck size={12} /> Verified Rating System
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground">
            Rate & Verify<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            Your rating is weighted by credibility. Prove you've actually watched it to increase its impact.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2">
          {(["select","rate","verify","result"] as Step[]).map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                s === step                             ? "bg-accent border-accent text-black" :
                arr.indexOf(step) > i                  ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400" :
                                                         "bg-surface border-border text-subtle"
              }`}>
                {arr.indexOf(step) > i ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              {i < arr.length - 1 && (
                <div className={`w-8 h-px ${arr.indexOf(step) > i ? "bg-emerald-500/40" : "bg-surface"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">

          {/* STEP 1 — Select anime */}
          {step === "select" && (
            <motion.div key="select" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              className="space-y-5"
            >
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search anime to rate…"
                  autoFocus
                  className="w-full pl-11 pr-4 py-4 bg-surface border border-border rounded-2xl text-foreground placeholder:text-subtle outline-none focus:border-accent/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(query ? filtered : animeList.filter(a => a.rating >= 8.7).slice(0, 8)).map(a => (
                  <motion.button
                    key={a.id}
                    whileHover={{ scale:1.02 }}
                    whileTap={{ scale:0.97 }}
                    onClick={() => selectAnime(a)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border hover:border-white/30 hover:bg-white/8 transition-all text-left group"
                  >
                    <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={a.image} alt={a.title} fill className="object-cover" sizes="36px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-muted group-hover:text-foreground transition-colors truncate">{a.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={9} fill="var(--app-accent)" className="text-accent-bright" />
                        <span className="text-[9px] text-subtle">{a.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Rate */}
          {step === "rate" && anime && (
            <motion.div key="rate" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-border">
                <div className="relative h-16 w-12 rounded-xl overflow-hidden shrink-0">
                  <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <p className="font-black text-foreground text-lg leading-tight">{anime.title}</p>
                  <p className="text-xs text-subtle mt-0.5">{anime.studio} · {anime.year}</p>
                </div>
              </div>

              <div>
                <p className="text-center text-sm font-bold text-muted mb-5">Select your rating</p>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <motion.button
                      key={n}
                      whileHover={{ scale:1.1 }}
                      whileTap={{ scale:0.9 }}
                      onClick={() => setRating(n)}
                      className={`aspect-square rounded-xl border font-black text-sm transition-all ${
                        rating === n
                          ? "bg-accent border-accent text-black shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                          : rating && n <= rating
                          ? "bg-accent/20 border-accent/30 text-accent-bright"
                          : "bg-surface border-border text-subtle hover:border-white/30 hover:text-foreground"
                      }`}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>

                {rating && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center mt-4">
                    <p className="text-3xl font-black text-foreground">{rating}<span className="text-subtle text-lg">/10</span></p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[...Array(Math.round(rating/2))].map((_,i) => (
                        <Star key={i} size={14} fill="var(--app-accent)" className="text-accent-bright" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                onClick={submitRating}
                disabled={!rating}
                className="w-full py-4 rounded-2xl bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Next: Verify Your Watch <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* STEP 3 — Verify */}
          {step === "verify" && anime && (
            <motion.div key="verify" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-sm font-bold text-muted">Prove you've watched <span className="text-foreground">{anime.title}</span></p>
                <p className="text-xs text-subtle mt-1">Your credibility score boosts your rating's weight on the platform</p>
              </div>

              {questions.map((q, qi) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: qi * 0.08 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-bold text-muted">{q.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.opts.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                          answers[q.id] === opt
                            ? "bg-accent/20 border-accent text-foreground"
                            : "border-border bg-surface text-muted hover:border-white/30 hover:text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

              <button
                onClick={submitVerify}
                disabled={Object.keys(answers).length < questions.length}
                className="w-full py-4 rounded-2xl bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest transition-all"
              >
                Submit Rating
              </button>
            </motion.div>
          )}

          {/* STEP 4 — Result */}
          {step === "result" && anime && (
            <motion.div key="result" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-3">
                <motion.div
                  initial={{ scale:0 }}
                  animate={{ scale:1 }}
                  transition={{ type:"spring", stiffness:200, damping:15, delay:0.1 }}
                  className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center text-3xl ${
                    cred === 100 ? "bg-accent/20 text-accent-bright" :
                    cred >= 50  ? "bg-emerald-500/20 text-emerald-400" :
                                   "bg-surface text-muted"
                  }`}
                >
                  {cred === 100 ? <Trophy size={36} /> : cred >= 50 ? <CheckCircle2 size={36} /> : <Sparkles size={36} />}
                </motion.div>

                <p className="text-2xl font-black text-foreground">{credLabel(cred)}</p>
                <p className="text-muted text-sm">Your rating for <span className="text-foreground font-bold">{anime.title}</span></p>

                <div className="flex items-center justify-center gap-2 mt-4">
                  {[...Array(Math.round((rating ?? 0)/2))].map((_,i) => (
                    <Star key={i} size={20} fill="var(--app-accent)" className="text-accent-bright" />
                  ))}
                  <span className="text-2xl font-black text-foreground ml-2">{rating}/10</span>
                </div>
              </div>

              {/* Credibility bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-subtle">
                  <span>Credibility Score</span><span>{cred.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${cred}%` }}
                    transition={{ duration:0.8, ease:"easeOut", delay:0.3 }}
                    className={`h-full rounded-full ${
                      cred === 100 ? "bg-gradient-to-r from-accent to-yellow-400" :
                      cred >= 50   ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                     "bg-gradient-to-r from-indigo-500 to-indigo-400"
                    }`}
                  />
                </div>
                <p className="text-xs text-subtle">
                  {cred === 100
                    ? "Perfect score! Your rating carries maximum weight."
                    : cred >= 50
                    ? "Good score. Your rating carries increased weight."
                    : "Low score. Answer correctly to boost your rating's impact."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3.5 rounded-2xl border border-border bg-surface hover:bg-surface text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={13} /> Rate Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
