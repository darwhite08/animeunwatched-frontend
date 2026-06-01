"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2, Loader2, Calendar, Cpu,
  Bell, Smartphone, Tv2, DollarSign, Sparkles,
  BookOpen, BookMarked, Trophy, Star, Chrome, Code2,
} from "lucide-react"

/* ── Types ── */
type Priority = "high" | "medium" | "low"

type RoadmapItem = {
  title: string
  icon: React.ElementType
  priority?: Priority
  note?: string
}

type Column = {
  status: "done" | "in-progress" | "planned"
  emoji: string
  label: string
  color: string
  bg: string
  border: string
  glow: string
  items: RoadmapItem[]
}

/* ── Data ── */
const COLUMNS: Column[] = [
  {
    status: "done",
    emoji: "✅",
    label: "Done",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "bg-emerald-500/6",
    items: [
      { title: "AI Oracle Neural Engine",             icon: Sparkles,     note: "12-dimension taste profile + match %" },
      { title: "Community System",                    icon: Star,         note: "Posts, clubs, threads, nested replies"  },
      { title: "Creator Studio",                      icon: Code2,        note: "Blogs, polls, feed posts + analytics"   },
      { title: "Gamification Engine",                 icon: Trophy,       note: "XP, badges, streaks, leaderboard"       },
      { title: "Anime Catalog + Jikan Integration",   icon: BookOpen,     note: "30,000+ titles, swappable provider"     },
      { title: "Season Browser + Calendar",           icon: Calendar,     note: "Seasonal index + airing calendar"       },
      { title: "Mobile-Responsive Design",            icon: Smartphone,   note: "Tailwind-first, tested on 320px–2xl"    },
      { title: "SEO + Structured Data",               icon: Cpu,          note: "JSON-LD, open graph, sitemap, 500+ pages" },
      { title: "MAL/AniList XML Import",              icon: BookOpen,     note: "Full list migration with progress bar"  },
      { title: "Mood Picker",                         icon: Sparkles,     note: "9 vibes → real anime recommendations"  },
      { title: "Spoiler Tags",                        icon: Star,         note: "Blur-until-click in community posts"    },
      { title: "REWATCHING Status",                   icon: Trophy,       note: "Most-requested missing status added"    },
      { title: "Club Watch Challenges",               icon: Trophy,       note: "Watch anime together with deadlines"    },
      { title: "Shareable Profile Cards",             icon: Star,         note: "/share/[username] for viral growth"     },
      { title: "Real-time Notifications",             icon: Bell,         note: "Socket.io + push badge + achievement"   },
      { title: "GDPR Cookie Consent",                 icon: Cpu,          note: "Non-blocking, localStorage persistence" },
      { title: "E2E Encrypted DMs",                   icon: Code2,        note: "ECDH P-256 + AES-GCM, server blind"    },
    ],
  },
  {
    status: "in-progress",
    emoji: "🚧",
    label: "In Progress",
    color: "text-accent-bright",
    bg: "bg-accent/10",
    border: "border-accent/20",
    glow: "bg-accent/6",
    items: [
      { title: "Real-time Notifications",             icon: Bell,        priority: "high",   note: "Socket.io + push badge"               },
      { title: "Native Mobile App",                   icon: Smartphone,  priority: "high",   note: "PWA → React Native migration"          },
      { title: "Anime Watch-Party",                   icon: Tv2,         priority: "medium", note: "Watch-together with synced chat"       },
      { title: "Creator Monetization",                icon: DollarSign,  priority: "medium", note: "Tips, Pro subscriptions, revenue share"},
      { title: "Advanced AI Fine-tuning",             icon: Sparkles,    priority: "low",    note: "Per-user model personalization"        },
    ],
  },
  {
    status: "planned",
    emoji: "📋",
    label: "Planned",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "bg-violet-500/6",
    items: [
      { title: "Manga Tracking Module",               icon: BookMarked,  priority: "high",   note: "Full list + ratings + reviews"         },
      { title: "Light Novel Tracking",                icon: BookOpen,    priority: "medium", note: "Paired with manga tracker"             },
      { title: "Anime Tournament Brackets",           icon: Trophy,      priority: "medium", note: "Community-voted seasonal brackets"     },
      { title: "Community Best-Of Lists",             icon: Star,        priority: "medium", note: "Curated top lists by category/genre"   },
      { title: "Chrome Extension + MAL Import",       icon: Chrome,      priority: "low",    note: "One-click import from MAL history"     },
      { title: "Public API",                          icon: Code2,       priority: "low",    note: "Third-party integrations + webhooks"   },
    ],
  },
]

const PRIORITY_MAP: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "text-rose-400",   bg: "bg-rose-500/10 border border-rose-500/20"   },
  medium: { label: "Medium", color: "text-accent-bright",  bg: "bg-accent/10 border border-accent/20" },
  low:    { label: "Low",    color: "text-blue-400",   bg: "bg-blue-500/10 border border-blue-500/20"   },
}

/* ── Card ── */
function RoadmapCard({
  item,
  col,
  index,
}: {
  item: RoadmapItem
  col: Column
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`group relative rounded-2xl border ${col.border} bg-background p-5 hover:bg-surface-2 transition-all overflow-hidden`}
    >
      {/* Hover glow */}
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity ${col.glow}`} />

      <div className="relative z-10 flex items-start gap-3">
        {/* Status icon */}
        <div className={`shrink-0 mt-0.5 p-2 rounded-xl ${col.bg}`}>
          {col.status === "done" ? (
            <CheckCircle2 size={14} className={col.color} />
          ) : col.status === "in-progress" ? (
            <Loader2 size={14} className={`${col.color} animate-spin`} />
          ) : (
            <item.icon size={14} className={col.color} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{item.title}</p>
          {item.note && (
            <p className="text-[11px] text-subtle mt-1 leading-relaxed">{item.note}</p>
          )}

          {/* Priority badge (in-progress + planned only) */}
          {item.priority && (
            <span className={`inline-block mt-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${PRIORITY_MAP[item.priority].bg} ${PRIORITY_MAP[item.priority].color}`}>
              {PRIORITY_MAP[item.priority].label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-8"
          >
            Public Roadmap
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.92] text-foreground mb-6"
          >
            Building in the<br />
            <span className="text-violet-400">Open.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-muted text-base max-w-xl mx-auto"
          >
            Full transparency on what we shipped, what we&#39;re building now, and what&#39;s coming next.
            No vaporware. No excuses.
          </motion.p>
        </div>
      </section>

      {/* ── Status legend ── */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-2">
        <div className="flex flex-wrap items-center gap-4">
          {COLUMNS.map((col) => (
            <div key={col.label} className="flex items-center gap-2">
              <span className="text-base leading-none">{col.emoji}</span>
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${col.color}`}>
                {col.label}
              </span>
              <span className="text-[10px] text-subtle font-mono">
                ({col.items.length})
              </span>
            </div>
          ))}
          <span className="ml-auto text-[10px] text-subtle font-mono hidden sm:block">
            Last updated: May 2026
          </span>
        </div>
      </div>

      {/* ── Kanban board ── */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {COLUMNS.map((col, ci) => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.08 }}
            >
              {/* Column header */}
              <div className={`flex items-center gap-2.5 mb-5 px-1`}>
                <span className="text-lg leading-none">{col.emoji}</span>
                <h2 className={`text-sm font-black uppercase tracking-[0.25em] ${col.color}`}>
                  {col.label}
                </h2>
                <span className={`ml-auto px-2.5 py-0.5 rounded-lg ${col.bg} ${col.color} text-[10px] font-black`}>
                  {col.items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {col.items.map((item, i) => (
                  <RoadmapCard key={item.title} item={item} col={col} index={i} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-indigo-600/8 to-transparent p-10 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/10 blur-[80px] rounded-full" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mb-3">
              Have an idea?
            </p>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground mb-3">
              Shape the Roadmap<span className="text-violet-400">.</span>
            </h2>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              Feature requests, complaints, and wild ideas are all welcome. The best ones get shipped.
            </p>
            <a
              href="https://discord.gg/kaiveron"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-black uppercase tracking-widest text-foreground transition-all"
            >
              Join the Discord
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
