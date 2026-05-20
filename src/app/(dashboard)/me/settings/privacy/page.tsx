"use client"

import { useState } from "react"
import { Shield, Globe, Lock, Eye, EyeOff, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { motion } from "framer-motion"

type Toggle = { id: string; label: string; desc: string; value: boolean }

export default function PrivacySettingsPage() {
  const { push } = useToast()
  const [saving, setSaving] = useState(false)
  const [toggles, setToggles] = useState<Toggle[]>([
    { id:"publicProfile",   label:"Public Profile",            desc:"Anyone can view your profile page and stats",    value:true  },
    { id:"showWatchlist",   label:"Public Watchlist",          desc:"Your watchlist is visible to other users",       value:true  },
    { id:"showStreak",      label:"Show Streak on Profile",    desc:"Display your streak count on your public page",  value:false },
    { id:"showReviews",     label:"Public Reviews",            desc:"Your reviews are visible to the community",      value:true  },
    { id:"showBlogs",       label:"Public Blog Articles",      desc:"Your published articles are publicly visible",   value:true  },
    { id:"searchable",      label:"Appear in Search",         desc:"Other users can find you in the Shinobi directory", value:true  },
    { id:"activityFeed",    label:"Public Activity",           desc:"Your recent activity shows on your profile",     value:false },
  ])
  const [blockList] = useState(["spam_bot_99", "toxic_user_2023"])

  const toggle = (id: string) => setToggles(ts => ts.map(t => t.id===id ? {...t, value:!t.value} : t))

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    push("Privacy settings saved!", "success")
  }

  const publicCount = toggles.filter(t => t.value).length

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div className="flex items-center gap-3">
        <Shield size={20} className="text-amber-400" />
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60">Data Control</p>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">Privacy</h1>
        </div>
      </div>

      {/* Summary */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${publicCount >= 4 ? "bg-emerald-500/8 border-emerald-500/20" : "bg-amber-500/8 border-amber-500/20"}`}>
        {publicCount >= 4 ? <Globe size={16} className="text-emerald-400 shrink-0" /> : <Lock size={16} className="text-amber-400 shrink-0" />}
        <div>
          <p className="text-sm font-black text-white">{publicCount >= 4 ? "Profile is mostly public" : "Profile is mostly private"}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{publicCount} of {toggles.length} privacy options set to public</p>
        </div>
      </div>

      {/* Toggles */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35 mb-5">Visibility Controls</p>
        {toggles.map(t => (
          <div key={t.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {t.value ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} className="text-white/20" />}
                <p className="text-sm font-bold text-white">{t.label}</p>
              </div>
              <p className="text-[10px] text-white/35 mt-0.5 ml-5">{t.desc}</p>
            </div>
            <button onClick={() => toggle(t.id)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${t.value ? "bg-amber-600" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${t.value ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Block list */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Blocked Users ({blockList.length})</p>
        {blockList.map(u => (
          <div key={u} className="flex items-center justify-between">
            <span className="text-sm font-bold text-white/60">@{u}</span>
            <button onClick={() => push(`Unblocked @${u}`, "info")}
              className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors"
            >Unblock</button>
          </div>
        ))}
        {blockList.length === 0 && <p className="text-sm text-white/30">No blocked users.</p>}
      </div>

      {/* Danger */}
      <div className="p-5 rounded-2xl border border-red-500/15 bg-red-500/5 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400/70">Data Deletion</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">Delete all personal data (GDPR)</p>
          <button onClick={() => push("Data deletion request submitted. You'll receive an email within 24h.", "info")}
            className="flex items-center gap-1.5 text-xs font-black text-red-400 border border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500/8 transition-colors"
          >
            <Trash2 size={12}/> Request
          </button>
        </div>
      </div>

      <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.97}} onClick={save} disabled={saving}
        className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 size={14} className="animate-spin"/>Saving…</> : "Save Privacy Settings"}
      </motion.button>
    </div>
  )
}
