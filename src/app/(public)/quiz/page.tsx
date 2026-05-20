"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

type Question = { id: number; q: string; opts: string[]; correct: string; anime: string }

function buildQuestions(animeList: Anime[]): Question[] {
  const qs: Question[] = []
  animeList.forEach((anime, i) => {
    if (i % 3 === 0 && anime.studio) qs.push({ id: qs.length, q: `Which studio produced "${anime.title}"?`, opts: shuffled([anime.studio, "MAPPA", "Madhouse", "Bones"].filter((v,idx,a)=>a.indexOf(v)===idx).slice(0,4)), correct: anime.studio, anime: anime.title })
    if (i % 3 === 1 && anime.year) qs.push({ id: qs.length, q: `In what year did "${anime.title}" premiere?`, opts: shuffled([String(anime.year), String(anime.year-1), String(anime.year+2), String(anime.year-2)].filter((v,idx,a)=>a.indexOf(v)===idx)), correct: String(anime.year), anime: anime.title })
    if (i % 3 === 2 && anime.episodes) qs.push({ id: qs.length, q: `How many episodes does "${anime.title}" have?`, opts: shuffled([String(anime.episodes), String(Math.max(1,anime.episodes-2)), String(anime.episodes+4), String(anime.episodes+12)].filter((v,idx,a)=>a.indexOf(v)===idx)), correct: String(anime.episodes), anime: anime.title })
  })
  return qs.slice(0, 10)
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function QuizPage() {
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 20 })
  const animeList = useMemo(() => (browseData?.data ?? []).map(mapDTO), [browseData])
  const questions = useMemo(() => buildQuestions(animeList), [animeList])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])

  const q = questions[idx]
  const isCorrect = selected === q?.correct
  const hasAnswered = selected !== null

  const handleSelect = (opt: string) => {
    if (hasAnswered) return
    setSelected(opt)
    const correct = opt === q.correct
    if (correct) setScore(s => s + 1)
    setAnswers(a => [...a, correct])
  }

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return }
    setIdx(i => i + 1)
    setSelected(null)
  }

  const reset = () => { setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswers([]) }

  const pct = Math.round((score / (questions.length || 1)) * 100)
  const grade = pct === 100 ? "Perfect! Legendary Shinobi 🏆" : pct >= 80 ? "Expert! Elite Jonin 🎯" : pct >= 60 ? "Good! Shinobi Level 👍" : pct >= 40 ? "Decent. Keep watching! 📺" : "Rookie! More anime needed 😅"

  if (isLoading || questions.length === 0) return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">
      {isLoading ? "Loading quiz…" : "Not enough anime data to build a quiz."}
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="max-w-md w-full text-center space-y-8">
        <div className="w-24 h-24 mx-auto rounded-[2rem] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Trophy size={40} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Quiz Complete</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">{score}/{questions.length}</h1>
          <p className="text-white/40 text-sm mt-2">{grade}</p>
        </div>
        {/* Answer breakdown */}
        <div className="flex justify-center gap-2">
          {answers.map((correct, i) => (
            <div key={i} className={`w-8 h-2 rounded-full ${correct ? "bg-emerald-500" : "bg-red-500"}`} />
          ))}
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
          <p className="text-3xl font-black text-white">{pct}%</p>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Accuracy</p>
        </div>
        <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black text-xs uppercase tracking-widest text-white transition-all">
          <RotateCcw size={14} /> Try Again
        </button>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full space-y-8 py-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-indigo-400" />
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60">Neural Quiz</p>
          </div>
          <span className="text-sm font-black text-white/40">{idx+1} / {questions.length}</span>
        </div>

        {/* Progress */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${((idx+1)/questions.length)*100}%` }} className="h-full bg-indigo-500 rounded-full" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">{q.anime}</p>
              <h2 className="text-2xl font-black tracking-tighter text-white">{q.q}</h2>
            </div>

            <div className="space-y-3">
              {q.opts.map(opt => {
                const state = !hasAnswered ? "idle" : opt === q.correct ? "correct" : opt === selected ? "wrong" : "idle"
                return (
                  <button key={opt} onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between ${
                      state === "correct" ? "bg-emerald-500/15 border-emerald-500/40 text-white" :
                      state === "wrong"   ? "bg-red-500/15 border-red-500/40 text-white" :
                      hasAnswered         ? "border-white/5 bg-white/[0.02] text-white/30" :
                                            "border-white/10 bg-white/[0.03] text-white/70 hover:border-indigo-500/40 hover:bg-indigo-500/8 hover:text-white"
                    }`}
                  >
                    {opt}
                    {state === "correct" && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                    {state === "wrong"   && <XCircle      size={16} className="text-red-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {hasAnswered && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className={`p-4 rounded-2xl border text-sm font-bold ${isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
              >
                {isCorrect ? "✓ Correct!" : `✗ The answer was: ${q.correct}`}
              </motion.div>
            )}

            {hasAnswered && (
              <button onClick={next} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black text-xs uppercase tracking-widest text-white transition-all">
                {idx + 1 >= questions.length ? "See Results" : "Next Question"} <ChevronRight size={14} />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
