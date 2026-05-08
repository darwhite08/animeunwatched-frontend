"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Save, Loader2, CheckCircle2, Globe, Flame, Star, Trophy } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useWatchlist } from "@/stores/watchlist.store"

export default function ProfileForm() {
  const { push } = useToast()
  const watchlistCount = useWatchlist(s => s.count)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    displayName: "Priyanshu",
    username:    "darwhite08",
    email:       "chandrapriyanshu10@gmail.com",
    bio:         "Lover of shonen and psychological anime. Chasing hidden gems since 2018.",
    avatarUrl:   "",
  })

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    setSaved(true)
    push("Profile updated successfully!", "success")
    setTimeout(() => setSaved(false), 3000)
  }

  const STATS = [
    { label: "Archives",     value: "124",          icon: Star,    color: "text-indigo-400" },
    { label: "On Watchlist", value: String(watchlistCount || 38), icon: Trophy, color: "text-amber-400"  },
    { label: "Streak",       value: "22 days",      icon: Flame,   color: "text-orange-500" },
    { label: "Global Rank",  value: "#812",         icon: Globe,   color: "text-blue-400"  },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/8">
        <div className="relative group shrink-0">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            {form.displayName[0]}
          </div>
          <button className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={16} className="text-white" />
          </button>
        </div>
        <div>
          <p className="text-xl font-black uppercase tracking-tighter text-white">{form.displayName}</p>
          <p className="text-sm text-white/40 font-mono mt-0.5">@{form.username}</p>
          <button className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors">
            <Upload size={11} /> Change avatar
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/8 flex flex-col gap-2">
            <Icon size={16} className={color} />
            <p className="text-2xl font-black tracking-tighter text-white">{value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{label}</p>
          </div>
        ))}
      </div>

      {/* Form fields */}
      <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/8 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Edit Profile</h3>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Display Name" value={form.displayName} onChange={set("displayName")} />
          <Field label="Username" value={form.username} onChange={set("username")} prefix="@" />
        </div>

        <Field label="Email" type="email" value={form.email} onChange={set("email")} />

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            rows={3}
            maxLength={200}
            className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all resize-none"
          />
          <p className="text-[9px] text-white/20 text-right mt-1">{form.bio.length}/200</p>
        </div>

        <div className="flex justify-end pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.3)]"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={14} /> Saved!</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function Field({
  label, value, onChange, type = "text", prefix,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  prefix?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-mono">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full rounded-2xl bg-black/30 border border-white/10 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all ${prefix ? "pl-7 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  )
}
