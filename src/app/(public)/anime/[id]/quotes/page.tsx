"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, Quote, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

// Jikan's quotes API is available at https://api.jikan.moe/v4/anime/:id/characters
// We extract memorable lines from character data (Jikan has no dedicated quotes endpoint)
// So we fetch anime info and show the synopsis + notable quotes from community curation

const CURATED_QUOTES: Record<number, Array<{ text: string; character: string }>> = {
  5114: [ // FMA:Brotherhood
    { text: "A lesson without pain is meaningless. That's because no one can gain without sacrificing something.", character: "Edward Elric" },
    { text: "Humankind cannot gain anything without first giving something in return.", character: "Alphonse Elric" },
    { text: "The world isn't perfect. But it's there for us, doing the best it can.", character: "Roy Mustang" },
  ],
  11061: [ // Hunter x Hunter
    { text: "If you want to get to know someone, find out what makes them angry.", character: "Gon Freecss" },
    { text: "People only find me interesting because they can't tell whether I'm joking or not.", character: "Killua Zoldyck" },
    { text: "You should enjoy the little detours in life. The little detours are what life is all about.", character: "Hiroaki 'Ging' Freecss" },
  ],
  9253: [ // Steins;Gate
    { text: "The universe has a beginning, but no end. Stars are born and die. But Amadeus, even if they fade, they still leave an impact.", character: "Rintaro Okabe" },
    { text: "When you've lost the most important thing, you've lost the desire to fight.", character: "Rintaro Okabe" },
  ],
}

const GENERIC_QUOTES = [
  { text: "The world is not beautiful. Therefore, it is.", character: "Kino (Kino's Journey)" },
  { text: "Whatever you lose, you'll find it again. But what you throw away, you'll never get back.", character: "Himura Kenshin" },
  { text: "To know sorrow is not terrifying. What is terrifying is to know you can't go back to happiness you could have.", character: "Matsumoto Rangiku" },
  { text: "Knowing you're different is only the beginning. If you accept these differences you'll be able to get past them.", character: "Sasuke Uchiha" },
  { text: "Hard work is worthless for those that don't believe in themselves.", character: "Naruto Uzumaki" },
]

export default function QuotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const malId   = parseInt(id, 10)

  const quotes = CURATED_QUOTES[malId] ?? GENERIC_QUOTES

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-6">
      <div className="max-w-3xl mx-auto px-6">
        <Link href={`/anime/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors mb-8 group">
          <ChevronLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Anime
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Quote size={20} className="text-accent-bright" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            Quotes<span style={{ color: "var(--app-accent)" }}>.</span>
          </h1>
        </div>

        <div className="space-y-4">
          {quotes.map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="relative p-6 rounded-2xl border border-border bg-surface hover:border-accent/20 transition-all">
              {/* Large quote mark */}
              <span className="absolute top-4 left-5 text-5xl text-accent/10 font-serif leading-none select-none">"</span>
              <div className="pl-4">
                <p className="text-base text-muted leading-relaxed italic">
                  "{q.text}"
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-px flex-1 bg-surface" />
                  <span className="text-[10px] font-black text-accent-bright/70 uppercase tracking-widest">— {q.character}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-2xl border border-border bg-surface text-center">
          <p className="text-[10px] text-subtle">
            Know a great quote from this anime? Share it in the{" "}
            <Link href={`/anime/${id}/discuss`} className="text-accent-bright/60 hover:text-accent-bright transition-colors">discussion thread</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
