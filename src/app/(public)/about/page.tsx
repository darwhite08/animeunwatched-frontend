"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Compass, Users, BookOpen,
  Zap, Shield, Globe, Server, Code2, Database, ArrowRight,
} from "lucide-react"

/* ── Pillars ── */
const PILLARS = [
  {
    icon: Compass,
    title: "Discovery",
    color: "text-accent-bright",
    bg: "bg-accent/10",
    border: "border-accent/20",
    desc: "AI-powered recommendations that understand your taste profile, not just what's trending. Our Neural Oracle maps your DNA across 12 taste dimensions so every suggestion lands.",
  },
  {
    icon: Users,
    title: "Community",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    desc: "Discord-quality community tools inside a Letterboxd-quality product. Dens, threads, polls, live debates — all built around anime, not around general chat.",
  },
  {
    icon: BookOpen,
    title: "Legacy",
    color: "text-accent-bright",
    bg: "bg-accent/10",
    border: "border-accent/20",
    desc: "Your watch history is a personality statement, not a spreadsheet. We archive every rating, review, and streak so your anime legacy lives on — publicly, beautifully.",
  },
]

/* ── Stats ── */
const STATS = [
  { label: "Shinobi Members", value: "12.4k" },
  { label: "Anime Archived", value: "1.2M" },
  { label: "Titles Catalogued", value: "24" },
  { label: "Rating Accuracy", value: "98.4%" },
]

/* ── Team ── */
const TEAM = [
  {
    initial: "D",
    name: "darwhite08",
    role: "Founder & Lead Shinobi",
    from: "from-accent to-orange-500",
    quote: "We had 400 anime on our lists and no platform worthy of them. So we built one.",
  },
  {
    initial: "R",
    name: "RyuuArchitect",
    role: "Core Systems Shinobi",
    from: "from-violet-500 to-fuchsia-600",
    quote: "If the tech can't handle 12.4k concurrent Shinobi without breaking a sweat, it's not good enough.",
  },
  {
    initial: "S",
    name: "ShadowDesigner",
    role: "UX & Motion Shinobi",
    from: "from-fuchsia-500 to-rose-500",
    quote: "Every frame of this UI was obsessed over. Anime fans deserve a platform as beautiful as the medium itself.",
  },
]

/* ── Tech stack ── */
const STACK = [
  { icon: Code2,    label: "Next.js 16",         note: "App Router · Server + Client components" },
  { icon: Zap,      label: "TypeScript Strict",   note: "No any. No escape hatches." },
  { icon: Database, label: "PostgreSQL + Prisma",  note: "Normalized catalog, optimistic writes" },
  { icon: Globe,    label: "Socket.io",            note: "Real-time community — posts, notifications, live scores" },
  { icon: Shield,   label: "JWT + httpOnly Cookie", note: "Stateless auth, refresh rotation, zero localStorage" },
  { icon: Server,   label: "Vercel Edge + Node",   note: "Sub-400ms TTFB on every anime detail page" },
]

/* ── Page ── */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/25 bg-accent/8 text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright mb-8"
          >
            About Kaiveron
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.92] text-foreground"
          >
            We Built The Anime Social Platform That Should Have{" "}
            <span style={{color:"var(--app-accent)"}}>Existed Years Ago.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-8 text-muted text-lg max-w-2xl mx-auto leading-relaxed"
          >
            MAL had the data. AniList had the design. Crunchyroll had the content. Nobody had all three
            plus a community worth staying in. We got tired of waiting.
          </motion.p>
        </div>
      </section>

      {/* ── Mission pillars ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mb-3">Our Mission</p>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            Three Pillars<span style={{color:"var(--app-accent)"}}>.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2rem] border ${p.border} bg-surface relative overflow-hidden group`}
            >
              <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${p.bg}`} />
              <div className={`p-3 rounded-2xl ${p.bg} ${p.color} w-fit mb-6`}>
                <p.icon size={22} />
              </div>
              <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${p.color} mb-3`}>
                {p.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-border bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-4xl font-black tracking-tighter text-foreground">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mb-3">The Crew</p>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            Founding Shinobi<span className="text-violet-500">.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-7 rounded-[2rem] border border-border bg-surface flex flex-col gap-5"
            >
              {/* Avatar */}
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${member.from} flex items-center justify-center font-black text-xl text-foreground`}>
                {member.initial}
              </div>
              {/* Info */}
              <div>
                <p className="text-base font-black text-foreground">{member.name}</p>
                <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-0.5">{member.role}</p>
              </div>
              {/* Quote */}
              <blockquote className="text-sm text-muted leading-relaxed italic border-l-2 border-accent/40 pl-4">
                "{member.quote}"
              </blockquote>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="border-t border-border bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mb-3">Engineering</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
              Built on Truth Not Hype<span style={{color:"var(--app-accent)"}}>.</span>
            </h2>
            <p className="mt-3 text-sm text-subtle">Every technology chosen for performance and longevity — not hype cycles.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {STACK.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-surface hover:border-accent/20 hover:bg-white/[0.035] transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-accent/10 text-accent-bright shrink-0 group-hover:bg-accent/15 transition-colors">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">{item.label}</p>
                  <p className="text-[10px] text-subtle mt-0.5">{item.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-accent/20 bg-gradient-to-br from-indigo-600/12 via-violet-600/8 to-transparent p-12 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/12 blur-[80px] rounded-full" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-foreground mb-4">
              Join The Dojo<span className="text-accent-bright">.</span>
            </h2>
            <p className="text-muted text-sm mb-8 max-w-lg mx-auto">
              12,400 Shinobi already archive their anime legacy here. Your list is waiting.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-bright text-sm font-black uppercase tracking-widest text-foreground transition-all active:scale-95"
            >
              Create Your Dojo Account <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
