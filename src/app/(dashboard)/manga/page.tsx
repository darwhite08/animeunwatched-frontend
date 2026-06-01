"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { BookOpen, BookMarked, Sparkles, ExternalLink } from "lucide-react"

const POPULAR_MANGA = [
  { title: "Berserk",             author: "Kentaro Miura",   genre: "Dark Fantasy",  year: 1989 },
  { title: "Vinland Saga",        author: "Makoto Yukimura", genre: "Historical",     year: 2005 },
  { title: "Vagabond",            author: "Takehiko Inoue",  genre: "Historical",     year: 1998 },
  { title: "Chainsaw Man",        author: "Tatsuki Fujimoto", genre: "Action",        year: 2018 },
  { title: "Attack on Titan",     author: "Hajime Isayama",  genre: "Dark Fantasy",   year: 2009 },
  { title: "Fullmetal Alchemist", author: "Hiromu Arakawa",  genre: "Action/Fantasy", year: 2001 },
]

export default function MangaPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 pb-32">
      {/* Header */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent-bright/60 mb-2">My Space</p>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground leading-none">
          Manga<span style={{ color: "var(--app-accent)" }}>.</span>
        </h1>
        <p className="text-muted text-sm mt-3 max-w-md leading-relaxed">
          Manga tracking is launching in Q3 2026 with full chapter progress, reading lists, and publisher integration.
        </p>
      </div>

      {/* Coming soon card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border p-10 space-y-6"
        style={{ borderColor: "rgba(139,92,246,0.3)", background: "linear-gradient(160deg,rgba(139,92,246,0.06),rgba(139,92,246,0.02))", boxShadow: "0 0 60px rgba(139,92,246,0.08)" }}>
        <div className="absolute -top-3 left-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-foreground"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
          Q3 2026
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <BookMarked size={24} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xl font-black text-foreground uppercase italic tracking-tight">Manga Tracker</p>
            <p className="text-xs text-subtle mt-1">Chapter-level progress · Reading lists · Publisher deeplinks</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: BookOpen,   label: "Chapter tracking",    desc: "Track progress per chapter and volume" },
            { icon: Sparkles,   label: "AI recommendations",  desc: "Manga suggestions based on your taste" },
            { icon: ExternalLink, label: "Publisher links",    desc: "Deep links to Manga Plus and VIZ Media" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl bg-surface border border-border space-y-2">
              <Icon size={16} className="text-violet-400" />
              <p className="text-xs font-black text-foreground">{label}</p>
              <p className="text-[9px] text-subtle leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <a href="mailto:kaiveron@gmail.com?subject=Manga Tracker Waitlist"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-foreground transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}>
          Join Waitlist
        </a>
      </motion.div>

      {/* Popular manga browseable now via AniList */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Popular Manga — Browse on AniList</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {POPULAR_MANGA.map((m, i) => (
            <motion.a key={m.title}
              href={`https://anilist.co/search/manga?search=${encodeURIComponent(m.title)}`}
              target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface hover:border-accent/20 hover:bg-white/[0.04] transition-all group">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center shrink-0">
                <BookOpen size={14} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground group-hover:text-accent-bright transition-colors">{m.title}</p>
                <p className="text-[9px] text-subtle truncate">{m.author} · {m.genre} · {m.year}</p>
              </div>
              <ExternalLink size={12} className="text-subtle group-hover:text-accent-bright transition-colors shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}
