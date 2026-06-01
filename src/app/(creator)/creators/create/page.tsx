"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Rss, FileText, Vote, ArrowRight, Sparkles } from "lucide-react"

const CONTENT_TYPES = [
  {
    href:    "/creators/create/feed",
    icon:    Rss,
    label:   "Feed Post",
    desc:    "Share a theory, hot take, or anime reaction with your followers.",
    color:   "from-indigo-600/30 to-indigo-800/10",
    border:  "hover:border-accent/50",
    glow:    "hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]",
    badge:   "text-accent-bright bg-accent/10 border-accent/20",
    tag:     "Quick",
  },
  {
    href:    "/creators/create/blog",
    icon:    FileText,
    label:   "Blog Article",
    desc:    "Write a long-form deep-dive, review, or editorial for the community.",
    color:   "from-purple-600/30 to-purple-800/10",
    border:  "hover:border-purple-500/50",
    glow:    "hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]",
    badge:   "text-purple-400 bg-purple-500/10 border-purple-500/20",
    tag:     "Long-form",
  },
  {
    href:    "/creators/create/polls",
    icon:    Vote,
    label:   "Community Poll",
    desc:    "Ask the community a question and collect votes for up to 6 options.",
    color:   "from-accent/30 to-amber-800/10",
    border:  "hover:border-accent/50",
    glow:    "hover:shadow-[0_0_40px_color-mix(in srgb, var(--app-accent) 15%, transparent)]",
    badge:   "text-accent-bright bg-accent/10 border-accent/20",
    tag:     "Interactive",
  },
]

export default function CreateLandingPage() {
  return (
    <div className="max-w-2xl space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
          <Sparkles size={18} className="text-muted" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Create Content</h1>
          <p className="text-sm text-muted">Choose what you want to publish</p>
        </div>
      </div>

      {/* Content type cards */}
      <div className="space-y-4">
        {CONTENT_TYPES.map(({ href, icon: Icon, label, desc, color, border, glow, badge, tag }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={href}
              className={`group flex items-center gap-6 p-6 rounded-2xl bg-surface-2 border border-border ${border} ${glow} transition-all duration-300`}
            >
              {/* Icon with gradient */}
              <div className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon size={24} className="text-muted" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{label}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full ${badge}`}>
                    {tag}
                  </span>
                </div>
                <p className="text-sm text-muted leading-snug">{desc}</p>
              </div>

              {/* Arrow */}
              <ArrowRight
                size={18}
                className="shrink-0 text-subtle group-hover:text-foreground group-hover:translate-x-1 transition-all"
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI tip */}
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-surface border border-border">
        <Sparkles size={16} className="text-accent-bright shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-muted">Tip — Generate with AI</p>
          <p className="text-xs text-subtle mt-0.5">
            Inside the blog or feed editor, click{" "}
            <span className="text-accent-bright">"Generate with AI"</span> to get a draft based on any anime title or topic.
          </p>
        </div>
      </div>
    </div>
  )
}
