"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown, Search, HelpCircle, Zap, Users,
  PenSquare, ShieldCheck, Github, MessageSquare, Mail,
} from "lucide-react"

/* ── Types ── */
type FAQItem = {
  q: string
  a: string
}

type FAQGroup = {
  title: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  items: FAQItem[]
}

/* ── Data ── */
const FAQ_GROUPS: FAQGroup[] = [
  {
    title: "Getting Started",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    items: [
      {
        q: "How do I create an account?",
        a: "Head to /register and enter your username, email, and password. After confirming your email you'll be taken through a short taste-profile onboarding that captures your genre, mood, and era preferences — this seeds your Neural Oracle recommendations immediately.",
      },
      {
        q: "What is the Neural Oracle?",
        a: "The Neural Oracle is our AI-powered anime discovery engine. It maps your taste across 12 dimensions (genre, mood, pacing, era, art style, and more) and generates ranked recommendations with a match percentage and a 'Why this?' explanation panel. Ask it anything in plain language — it understands context like a human would.",
      },
      {
        q: "How does the watchlist work?",
        a: "The watchlist is your personal anime archive. From any anime detail page, tap the status widget to set a status: Watching, Completed, On Hold, Dropped, or Plan to Watch. You can also log episode progress and leave a private rating. Your list is public by default but you can set it to private in Settings.",
      },
    ],
  },
  {
    title: "Features",
    icon: HelpCircle,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    items: [
      {
        q: "How do XP and reputation work?",
        a: "XP (Experience Points) accumulates from every action: completing an anime (+50 XP), writing a review (+30 XP), rating an entry (+10 XP), maintaining a daily streak (+15 XP/day), publishing a blog (+40 XP), and receiving likes on your content (+2 XP each). Reputation is separate — it rises and falls based on community feedback on your reviews and posts.",
      },
      {
        q: "What are the level titles?",
        a: "Kaiveron has 100 levels with Shinobi-style rank titles. Levels 1–10 are 'Academy Student', 11–25 are 'Genin', 26–45 are 'Chunin', 46–65 are 'Jonin', 66–85 are 'ANBU', 86–99 are 'Kage', and level 100 is the rare 'Eternal Oracle'. Your level title shows on your public profile and beside your username in all community spaces.",
      },
      {
        q: "How do streaks work?",
        a: "A streak counts the number of consecutive days you log at least one anime activity (watching, rating, reviewing). Log in and do something every day to keep it going. Your current and longest streaks are displayed on your Streak Hub. Streaks reset at midnight UTC if no activity is logged.",
      },
      {
        q: "What are badges?",
        a: "Badges are milestone awards that appear permanently on your profile. Examples include 'First Chronicle' (first review), 'Century Club' (100 anime completed), 'Flame Keeper' (30-day streak), 'Oracle Whisperer' (50 AI Oracle queries), and 'Dojo Founder' (early supporter). Badges cannot be removed or hidden.",
      },
    ],
  },
  {
    title: "Creator Studio",
    icon: PenSquare,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    items: [
      {
        q: "How do I become a creator?",
        a: "Creator Studio access is automatically granted when you reach Reputation 100 and Level 10. Once unlocked, navigate to /creators and you'll find your studio dashboard, blog editor, poll builder, and feed composer. There's no application process — earn it through quality contributions.",
      },
      {
        q: "What types of content can I publish?",
        a: "Three content types: Blogs (long-form articles with Markdown + cover image), Polls (single-choice, multi-choice, or ranked-choice), and Feed Posts (short-form micro-posts with image support). Each content type has its own analytics panel inside Creator Studio showing views, likes, and engagement rate.",
      },
      {
        q: "How does the reputation gate work?",
        a: "The reputation gate is a quality filter. New accounts start at Reputation 0. Upvotes on reviews and posts increase reputation; downvotes decrease it. Reaching Rep 100 unlocks Creator Studio. Rep 250 unlocks advanced analytics. Rep 500 adds a verified creator badge. Rep can not go below 0.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    items: [
      {
        q: "How do I export my data?",
        a: "Go to Settings → Privacy → Export Data. We'll generate a JSON archive of your watchlist, ratings, reviews, and profile metadata. The export is ready within minutes and emailed to your registered address. GDPR-compliant: all data in machine-readable format.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Settings → Account → Delete Account. Deletion is permanent and irreversible after a 14-day grace period. During the grace period you can reactivate by logging in. After deletion, all personal data is purged from our servers in accordance with GDPR Article 17.",
      },
      {
        q: "Is my watch history private?",
        a: "By default your watchlist is public — this is core to the social identity mission of the platform. You can set your list to Private in Settings → Privacy → Watchlist Visibility. Private lists are invisible to other users and excluded from leaderboards, but your XP and level are still calculated.",
      },
    ],
  },
]

/* ── Accordion item ── */
function AccordionItem({ item, groupColor }: { item: FAQItem; groupColor: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#0a0a0a] hover:border-white/10 transition-colors">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors leading-snug">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className={`shrink-0 ${groupColor}`}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-6 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Page ── */
export default function HelpPage() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return FAQ_GROUPS
    return FAQ_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    })).filter((g) => g.items.length > 0)
  }, [query])

  const totalVisible = filtered.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/8 text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-8"
          >
            Help Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.92] text-white mb-6"
          >
            Got Questions?<br />
            <span className="text-amber-400">We Have Answers.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-white/40 text-base max-w-lg mx-auto mb-10"
          >
            Everything you need to know about Kaiveron — the Neural Oracle, gamification, creator tools, and more.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="relative max-w-xl mx-auto"
          >
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              placeholder="Search questions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-5 py-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] transition-all"
            />
            {query && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/25 uppercase tracking-widest">
                {totalVisible} result{totalVisible !== 1 ? "s" : ""}
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* FAQ list — 2/3 width */}
          <div className="lg:col-span-2 space-y-10">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <HelpCircle size={40} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">No questions match &quot;{query}&quot;</p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-4 text-amber-400 text-xs font-black uppercase tracking-widest hover:text-amber-300 transition-colors"
                >
                  Clear search
                </button>
              </motion.div>
            ) : (
              filtered.map((group, gi) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.07 }}
                >
                  {/* Group header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2 rounded-xl ${group.bg} ${group.color}`}>
                      <group.icon size={15} />
                    </div>
                    <h2 className={`text-sm font-black uppercase tracking-[0.25em] ${group.color}`}>
                      {group.title}
                    </h2>
                    <span className="text-[9px] font-black text-white/15 uppercase tracking-widest ml-1">
                      {group.items.length} Q
                    </span>
                  </div>

                  {/* Accordion items */}
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <AccordionItem key={item.q} item={item} groupColor={group.color} />
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Contact Support card — 1/3 width, sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-indigo-600/10 via-violet-600/6 to-transparent p-8"
              >
                <div className="h-12 w-12 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-6">
                  <MessageSquare size={20} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-black tracking-tighter uppercase italic text-white mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Can&#39;t find what you&#39;re looking for? Our team responds within 48 hours.
                </p>

                <div className="space-y-3">
                  <a
                    href="https://github.com/darwhite08"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-amber-500/30 hover:bg-white/[0.04] transition-all group"
                  >
                    <Github size={16} className="text-white/40 group-hover:text-white transition-colors" />
                    <div>
                      <p className="text-xs font-black text-white/70 group-hover:text-white transition-colors">GitHub Issues</p>
                      <p className="text-[10px] text-white/25">Bug reports &amp; technical</p>
                    </div>
                  </a>

                  <a
                    href="https://discord.gg/kaiveron"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all group"
                  >
                    <Users size={16} className="text-white/40 group-hover:text-violet-400 transition-colors" />
                    <div>
                      <p className="text-xs font-black text-white/70 group-hover:text-white transition-colors">Discord Community</p>
                      <p className="text-[10px] text-white/25">Chat with the community</p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@athavita.com"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-amber-500/30 hover:bg-white/[0.04] transition-all group"
                  >
                    <Mail size={16} className="text-white/40 group-hover:text-amber-400 transition-colors" />
                    <div>
                      <p className="text-xs font-black text-white/70 group-hover:text-white transition-colors">Email Support</p>
                      <p className="text-[10px] text-white/25">info@athavita.com</p>
                    </div>
                  </a>
                </div>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
                className="rounded-[2rem] border border-white/6 bg-[#0a0a0a] p-6 space-y-4"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/20">Response Times</p>
                {[
                  { label: "GitHub Issues", time: "< 24h", color: "text-emerald-400" },
                  { label: "Discord",        time: "< 2h",  color: "text-violet-400"  },
                  { label: "Email",          time: "< 48h", color: "text-amber-400"   },
                ].map(({ label, time, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className={`text-xs font-black ${color}`}>{time}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
