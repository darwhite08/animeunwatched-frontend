"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Github, MessageSquare, Mail, Twitter, Send, ArrowUpRight } from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Contact cards data ── */
const CONTACT_CARDS = [
  {
    icon: Github,
    title: "Bug Reports",
    desc: "Found a bug? Open a GitHub issue and we'll triage it within 24 hours.",
    cta: "Open an Issue",
    href: "https://github.com/darwhite08/kaiveron-frontend/issues/new",
    color: "text-white",
    bg: "bg-white/8",
    border: "border-white/10",
    hoverBorder: "hover:border-white/20",
  },
  {
    icon: MessageSquare,
    title: "Feature Requests",
    desc: "Have an idea? Drop it in the #feature-requests channel on our Discord server.",
    cta: "Join Discord",
    href: "https://discord.gg/kaiveron",
    color: "text-violet-400",
    bg: "bg-violet-500/8",
    border: "border-violet-500/15",
    hoverBorder: "hover:border-violet-500/35",
  },
  {
    icon: Mail,
    title: "Business",
    desc: "Partnerships, press, or sponsorships — email us directly and we'll respond within 48 hours.",
    cta: "info@athavita.com",
    href: "mailto:info@athavita.com",
    color: "text-indigo-400",
    bg: "bg-indigo-500/8",
    border: "border-indigo-500/15",
    hoverBorder: "hover:border-indigo-500/35",
  },
]

const CATEGORIES = ["Bug Report", "Feature Request", "Business", "Press"] as const
type Category = (typeof CATEGORIES)[number]

const SOCIAL_LINKS = [
  { icon: Github,         label: "GitHub",  href: "https://github.com/darwhite08"        },
  { icon: Twitter,        label: "Twitter", href: "https://twitter.com/kaiveron"   },
  { icon: MessageSquare,  label: "Discord", href: "https://discord.gg/kaiveron"    },
]

/* ── Page ── */
export default function ContactPage() {
  const push = useToast((s) => s.push)

  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [category, setCategory] = useState<Category>("Bug Report")
  const [message, setMessage]   = useState("")
  const [sending, setSending]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    // Simulate async submit
    setTimeout(() => {
      push("Message received! We'll reply within 48 hours.", "success")
      setName("")
      setEmail("")
      setCategory("Bug Report")
      setMessage("")
      setSending(false)
    }, 900)
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8"
          >
            Contact
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.92] text-white mb-4"
          >
            Get in<br />
            <span className="text-indigo-400">Touch.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-white/40 text-base max-w-md mx-auto"
          >
            Bug, idea, collab, or just want to say hi — we read every message.
          </motion.p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-14">

        {/* ── Contact cards ── */}
        <div className="grid md:grid-cols-3 gap-5">
          {CONTACT_CARDS.map((card, i) => (
            <motion.a
              key={card.title}
              href={card.href}
              target={card.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className={`group flex flex-col gap-5 p-7 rounded-[2rem] border ${card.border} ${card.hoverBorder} ${card.bg} bg-[#0a0a0a] transition-all overflow-hidden relative`}
            >
              <div className={`p-3 rounded-2xl bg-white/5 w-fit ${card.color}`}>
                <card.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-black uppercase italic tracking-tight ${card.color} mb-2`}>
                  {card.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">{card.desc}</p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${card.color}`}>
                {card.cta}
                <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* ── Contact form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2.5rem] border border-white/8 bg-[#080808] p-8 md:p-12"
        >
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25 mb-2">Direct Message</p>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Send a Message<span style={{color:"#f59e0b"}}>.</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#111] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here…"
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-white/20 font-mono">
                We reply within 48 hours
              </p>
              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-black uppercase tracking-widest text-white transition-all"
              >
                {sending ? (
                  <>Sending…</>
                ) : (
                  <>Send Message <Send size={14} /></>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* ── Social links ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-5"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/20">Find us online</p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.08 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] text-white/40 hover:text-white hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all text-xs font-black uppercase tracking-wider"
              >
                <Icon size={14} />
                {label}
              </motion.a>
            ))}
          </div>
        </motion.div>

      </section>
    </div>
  )
}
