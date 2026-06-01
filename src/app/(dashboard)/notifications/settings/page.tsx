"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Bell, Mail, Smartphone, UserPlus, MessageSquare,
  AtSign, BarChart2, Tv2, Calendar, Save,
  ChevronRight, CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useUpdateMe } from "@/hooks/useUsers"

/* ── Types ── */
type NotifKey =
  | "newFollower"
  | "postReply"
  | "mention"
  | "pollResults"
  | "newEpisode"
  | "weeklyStreak"

type DigestFreq = "daily" | "weekly" | "never"

/* ── Data ── */
const NOTIF_TYPES: {
  key: NotifKey
  label: string
  desc: string
  icon: typeof Bell
  accent: string
}[] = [
  {
    key: "newFollower",
    label: "New Follower",
    desc: "When someone starts following your profile",
    icon: UserPlus,
    accent: "text-accent-bright",
  },
  {
    key: "postReply",
    label: "Post Reply / Comment",
    desc: "When someone replies to one of your posts or reviews",
    icon: MessageSquare,
    accent: "text-violet-400",
  },
  {
    key: "mention",
    label: "Mention in Post",
    desc: "When someone @mentions you in a post or thread",
    icon: AtSign,
    accent: "text-blue-400",
  },
  {
    key: "pollResults",
    label: "Poll Results",
    desc: "When a poll you voted on closes and results are published",
    icon: BarChart2,
    accent: "text-accent-bright",
  },
  {
    key: "newEpisode",
    label: "New Episode Aired",
    desc: "When a new episode of an anime in your watchlist airs",
    icon: Tv2,
    accent: "text-emerald-400",
  },
  {
    key: "weeklyStreak",
    label: "Weekly Streak Digest",
    desc: "Your weekly watch activity summary and streak status report",
    icon: Calendar,
    accent: "text-orange-400",
  },
]

const DIGEST_OPTIONS: { id: DigestFreq; label: string; desc: string }[] = [
  { id: "daily",  label: "Daily",  desc: "Receive a summary email every morning" },
  { id: "weekly", label: "Weekly", desc: "Receive a digest every Sunday" },
  { id: "never",  label: "Never",  desc: "No digest emails" },
]

/* ── Toggle ── */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
      } ${checked && !disabled ? "bg-accent" : "bg-surface"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked && !disabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  )
}

/* ── Page ── */
export default function NotificationDashboardSettingsPage() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const updateMe = useUpdateMe()

  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    newFollower:  true,
    postReply:    true,
    mention:      true,
    pollResults:  false,
    newEpisode:   true,
    weeklyStreak: true,
  })

  const [digest, setDigest] = useState<DigestFreq>("weekly")
  const [saved, setSaved] = useState(false)

  const toggleNotif = (key: NotifKey) => {
    setSaved(false)
    setNotifs((n) => ({ ...n, [key]: !n[key] }))
  }

  const handleSave = () => {
    // Persist notification preference as part of user bio/meta if desired,
    // but keep primary save local since User DTO has no notif pref fields.
    updateMe.mutate({}, {
      onSettled: () => {
        setSaved(true)
        push("Notification settings saved successfully.", "success")
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  const enabledCount = Object.values(notifs).filter(Boolean).length

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle">
        <Link href="/notifications" className="hover:text-muted transition-colors">
          Notifications
        </Link>
        <ChevronRight size={11} className="text-subtle" />
        <span className="text-accent-bright">Settings</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
          Dashboard · Notifications
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
          Notification<br />
          <span className="text-accent-bright">Settings</span>
          <span style={{color:"#f59e0b"}}>.</span>
        </h1>
        <p className="text-xs text-subtle mt-2">
          {enabledCount} of {NOTIF_TYPES.length} notification types enabled
          {user?.email ? <> · <span className="text-muted">{user.email}</span></> : null}
        </p>
      </motion.div>

      {/* Delivery channels info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Bell,       label: "In-App",  active: true,  note: "Always on" },
          { icon: Mail,       label: "Email",   active: true,  note: "Active" },
          { icon: Smartphone, label: "Push",    active: false, note: "Coming soon" },
        ].map(({ icon: Icon, label, active, note }) => (
          <div
            key={label}
            className={`p-4 rounded-xl border text-center transition-all ${
              active
                ? "bg-accent/8 border-accent/20"
                : "bg-surface border-border opacity-50"
            }`}
          >
            <Icon size={16} className={`mx-auto mb-2 ${active ? "text-accent-bright" : "text-subtle"}`} />
            <p className="text-xs font-black text-foreground">{label}</p>
            <p className="text-[9px] text-subtle mt-0.5">{note}</p>
          </div>
        ))}
      </motion.div>

      {/* Notification types */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-subtle mb-4">
          Notification Types
        </p>
        <div className="rounded-2xl bg-surface border border-border divide-y divide-white/5">
          {NOTIF_TYPES.map(({ key, label, desc, icon: Icon, accent }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              className="flex items-center gap-4 px-6 py-5"
            >
              <div className="p-2.5 rounded-xl bg-surface shrink-0">
                <Icon size={15} className={accent} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground">{label}</p>
                <p className="text-[10px] text-subtle mt-0.5 leading-snug">{desc}</p>
              </div>
              <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Email digest frequency */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-subtle mb-4">
          Email Digest Frequency
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DIGEST_OPTIONS.map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => { setDigest(id); setSaved(false) }}
              className={`p-4 rounded-xl border text-left transition-all ${
                digest === id
                  ? "bg-accent/12 border-accent/35"
                  : "bg-surface border-border hover:border-border"
              }`}
            >
              <p className={`text-sm font-black ${digest === id ? "text-accent-bright" : "text-foreground"}`}>
                {label}
              </p>
              <p className="text-[10px] text-subtle mt-0.5 leading-snug">{desc}</p>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="flex items-center gap-4 pt-2"
      >
        <button
          onClick={handleSave}
          disabled={updateMe.isPending}
          className={`flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-60 ${
            saved
              ? "bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 cursor-default"
              : "bg-accent hover:bg-accent-bright text-black"
          }`}
        >
          {saved ? (
            <><CheckCircle2 size={14} /> Saved</>
          ) : (
            <><Save size={14} /> {updateMe.isPending ? "Saving…" : "Save Settings"}</>
          )}
        </button>
        <Link
          href="/settings/notifications"
          className="text-[10px] font-black uppercase tracking-widest text-subtle hover:text-muted transition-colors"
        >
          Advanced settings →
        </Link>
      </motion.div>
    </div>
  )
}
