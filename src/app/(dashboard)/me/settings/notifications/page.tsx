"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Bell, Mail, Smartphone, UserPlus, MessageSquare, AtSign,
  BarChart2, Tv2, Calendar, Trash2, CheckCircle2, AlertTriangle,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type DeliveryId = "app" | "email" | "push"
type NotifKey =
  | "newFollower"
  | "postReply"
  | "mention"
  | "pollResults"
  | "newEpisode"
  | "weeklyStreak"

/* ── Data ── */
const DELIVERY: { id: DeliveryId; label: string; icon: typeof Bell; desc: string; disabled?: boolean }[] = [
  { id: "app",   label: "In-App",          icon: Bell,       desc: "Real-time notifications inside the platform" },
  { id: "email", label: "Email",           icon: Mail,       desc: "Delivered to your registered email address" },
  { id: "push",  label: "Push",            icon: Smartphone, desc: "Browser push notifications", disabled: true },
]

const NOTIF_TYPES: {
  key: NotifKey
  label: string
  desc: string
  icon: typeof Bell
  accent: string
}[] = [
  { key: "newFollower",  label: "New Follower",         desc: "When someone starts following your profile",                    icon: UserPlus,     accent: "text-indigo-400" },
  { key: "postReply",    label: "Post Reply / Comment", desc: "When someone replies to one of your posts or reviews",          icon: MessageSquare, accent: "text-violet-400" },
  { key: "mention",      label: "Mention in Post",      desc: "When someone @mentions you in a post or thread",               icon: AtSign,       accent: "text-blue-400"   },
  { key: "pollResults",  label: "Poll Results",         desc: "When a poll you voted on closes and results are published",     icon: BarChart2,    accent: "text-amber-400"  },
  { key: "newEpisode",   label: "New Episode Aired",    desc: "When a new episode of an anime in your watchlist airs",        icon: Tv2,          accent: "text-emerald-400" },
  { key: "weeklyStreak", label: "Weekly Streak Digest", desc: "Your weekly watch activity summary and streak status report",  icon: Calendar,     accent: "text-orange-400" },
]

/* ── Toggle component ── */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
      } ${checked && !disabled ? "bg-indigo-600" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked && !disabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  )
}

/* ── Confirmation dialog ── */
function ConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-[#0d0d0d] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <h3 className="text-lg font-black tracking-tighter text-white uppercase italic">Are you sure?</h3>
        </div>
        <p className="text-sm text-white/40 leading-relaxed mb-6">
          You will stop receiving all notifications. You can re-enable individual channels at any time.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-widest text-white transition-colors"
          >
            Unsubscribe
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Page ── */
export default function NotificationSettingsPage() {
  const { push } = useToast()

  const [delivery, setDelivery] = useState<Record<DeliveryId, boolean>>({
    app:   true,
    email: true,
    push:  false,
  })

  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    newFollower:  true,
    postReply:    true,
    mention:      true,
    pollResults:  false,
    newEpisode:   true,
    weeklyStreak: true,
  })

  const [showConfirm, setShowConfirm] = useState(false)

  const toggleDelivery = (id: DeliveryId) => {
    if (id === "app") return // always on
    setDelivery(d => ({ ...d, [id]: !d[id] }))
  }

  const toggleNotif = (key: NotifKey) => {
    setNotifs(n => ({ ...n, [key]: !n[key] }))
  }

  const fireTestNotification = () => {
    push("Test notification fired successfully!", "success")
  }

  const handleUnsubscribeAll = () => {
    setDelivery({ app: true, email: false, push: false })
    setNotifs({
      newFollower:  false,
      postReply:    false,
      mention:      false,
      pollResults:  false,
      newEpisode:   false,
      weeklyStreak: false,
    })
    setShowConfirm(false)
    push("Unsubscribed from all notifications.", "info")
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-amber-400/60 mb-2">
          Settings · Notifications
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
          Notification<br />Preferences
        </h1>
        <p className="text-xs text-white/30 mt-2">
          Control exactly when and how Kaiveron reaches you.
        </p>
      </div>

      {/* Delivery methods */}
      <section>
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/25 mb-4">Delivery Methods</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DELIVERY.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`p-5 rounded-2xl border transition-all ${
                delivery[d.id] && !d.disabled
                  ? "bg-indigo-600/10 border-indigo-500/25"
                  : "bg-white/[0.02] border-white/8"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <d.icon
                  size={16}
                  className={delivery[d.id] && !d.disabled ? "text-indigo-400" : "text-white/25"}
                />
                <Toggle
                  checked={delivery[d.id]}
                  onChange={() => toggleDelivery(d.id)}
                  disabled={d.id === "app" || d.disabled}
                />
              </div>
              <p className="text-sm font-black text-white">{d.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5 leading-snug">{d.desc}</p>
              {d.disabled && (
                <span className="mt-2 inline-block text-[8px] font-black uppercase tracking-widest text-amber-400/70 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15">
                  Coming soon
                </span>
              )}
              {d.id === "app" && (
                <span className="mt-2 inline-block text-[8px] font-black uppercase tracking-widest text-emerald-400/70 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                  Always on
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Notification types */}
      <section>
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/25 mb-4">Notification Types</p>
        <div className="rounded-2xl bg-white/[0.02] border border-white/8 divide-y divide-white/5">
          {NOTIF_TYPES.map(({ key, label, desc, icon: Icon, accent }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="flex items-center gap-4 px-6 py-5"
            >
              <div className="p-2.5 rounded-xl bg-white/[0.03] shrink-0">
                <Icon size={15} className={accent} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{label}</p>
                <p className="text-[10px] text-white/35 mt-0.5 leading-snug">{desc}</p>
              </div>
              <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={fireTestNotification}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-xs font-black uppercase tracking-widest text-white transition-all"
        >
          <CheckCircle2 size={14} className="text-emerald-400" />
          Test Notification
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/35 text-xs font-black uppercase tracking-widest text-red-400 transition-all"
        >
          <Trash2 size={14} />
          Unsubscribe from All
        </button>
      </section>

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleUnsubscribeAll}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
