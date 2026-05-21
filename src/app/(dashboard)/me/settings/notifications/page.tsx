"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, BellOff, CheckCircle2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"

type PrefKey =
  | "new_follower" | "post_liked" | "comment_reply" | "mention"
  | "review_liked" | "achievement" | "streak_reminder" | "weekly_digest"

interface NotifPref {
  key: PrefKey
  label: string
  desc: string
  channels: ("push" | "email")[]
}

const PREFS: NotifPref[] = [
  { key: "new_follower",    label: "New follower",        desc: "When someone follows you",             channels: ["push"] },
  { key: "post_liked",      label: "Post liked",          desc: "When someone likes your post",          channels: ["push"] },
  { key: "comment_reply",   label: "Comments & replies",  desc: "When someone replies to your content",  channels: ["push"] },
  { key: "mention",         label: "Mentions",            desc: "When @you appears in a post or thread", channels: ["push"] },
  { key: "review_liked",    label: "Review liked",        desc: "When someone likes your review",        channels: ["push"] },
  { key: "achievement",     label: "Achievements",        desc: "New badges, milestones, level-ups",     channels: ["push"] },
  { key: "streak_reminder", label: "Streak reminders",    desc: "Daily reminder if streak is at risk",   channels: ["push", "email"] },
  { key: "weekly_digest",   label: "Weekly digest",       desc: "Summary of activity each week",         channels: ["email"] },
]

const STORAGE_KEY = "aw_notif_prefs"

function loadPrefs(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") } catch { return {} }
}

export default function NotificationPrefsPage() {
  const { push } = useToast()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { setPrefs(loadPrefs()) }, [])

  const toggle = (key: string) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  const save = async () => {
    setSaving(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    // best-effort sync to backend (no-op endpoint)
    try {
      await fetch("/api/v1/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefs),
      })
    } catch { /* local storage is the source of truth */ }
    setSaving(false)
    push("Notification preferences saved!", "success")
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-amber-400/60 mb-2">Settings · Notifications</p>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Notifications</h1>
        <p className="text-xs text-white/30 mt-2 flex items-center gap-2">
          <Bell size={11} className="text-amber-400" /> Choose what you want to be notified about.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="space-y-3">
        {PREFS.map((pref, i) => {
          const allOn = pref.channels.every(ch => prefs[`${pref.key}_${ch}`] !== false)
          return (
            <motion.div key={pref.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/12 transition-all">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${allOn ? "bg-amber-500/15" : "bg-white/5"}`}>
                {allOn ? <Bell size={16} className="text-amber-400" /> : <BellOff size={16} className="text-white/25" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{pref.label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{pref.desc}</p>
                <div className="flex gap-2 mt-2">
                  {pref.channels.map(ch => {
                    const k = `${pref.key}_${ch}`
                    const on = prefs[k] !== false
                    return (
                      <button key={ch} onClick={() => toggle(k)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                          on ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/8 text-white/25 hover:text-white/40"
                        }`}>
                        {on && <CheckCircle2 size={8} />}{ch}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <button onClick={save} disabled={saving}
        className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.01] disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
        {saving ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  )
}
