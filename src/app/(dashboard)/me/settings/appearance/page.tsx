"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Palette, Monitor, Moon, Sun, Loader2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"

const ACCENT_COLORS = [
  { id:"indigo",  hex:"#6366f1", label:"Indigo (Default)" },
  { id:"violet",  hex:"#8b5cf6", label:"Violet"           },
  { id:"rose",    hex:"#f43f5e", label:"Rose"             },
  { id:"emerald", hex:"#10b981", label:"Emerald"          },
  { id:"amber",   hex:"#f59e0b", label:"Amber"            },
  { id:"sky",     hex:"#0ea5e9", label:"Sky Blue"         },
]

const THEMES = [
  { id:"dark",   icon:Moon,    label:"Dark",   desc:"Default — pure black" },
  { id:"amoled", icon:Monitor, label:"AMOLED",  desc:"True black for OLED"  },
]

const FONT_SIZES = ["Small","Medium","Large","X-Large"]
const CARD_STYLES = ["Rounded","Sharp","Floating"]

export default function AppearancePage() {
  const { push } = useToast()
  const [theme,    setTheme]    = useState("dark")
  const [accent,   setAccent]   = useState("indigo")
  const [fontSize, setFontSize] = useState("Medium")
  const [cardStyle,setCardStyle]= useState("Rounded")
  const [saving,   setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    push("Appearance saved!", "success")
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div className="flex items-center gap-3">
        <Palette size={20} className="text-amber-400" />
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60">Customization</p>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">Appearance</h1>
        </div>
      </div>

      {/* Theme */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Theme</p>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(({ id, icon: Icon, label, desc }) => (
            <button key={id} onClick={() => setTheme(id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                theme === id ? "border-amber-500/50 bg-amber-500/10" : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <Icon size={20} className={theme === id ? "text-amber-400" : "text-white/30"} />
              <p className="font-bold text-sm mt-3 text-white">{label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
        <p className="text-[9px] text-white/20">Light mode is not planned — we're a dark platform ☾</p>
      </div>

      {/* Accent color */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Accent Color</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(c => (
            <button key={c.id} onClick={() => setAccent(c.id)} title={c.label}
              className={`relative w-10 h-10 rounded-full transition-all ${
                accent === c.id ? "ring-2 ring-white/60 ring-offset-2 ring-offset-black scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        <p className="text-[9px] text-white/25">Currently: {ACCENT_COLORS.find(c=>c.id===accent)?.label}</p>
      </div>

      {/* Font size */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Text Size</p>
        <div className="flex gap-2 flex-wrap">
          {FONT_SIZES.map(s => (
            <button key={s} onClick={() => setFontSize(s)}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                fontSize === s ? "bg-amber-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Card style */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Card Style</p>
        <div className="flex gap-2">
          {CARD_STYLES.map(s => (
            <button key={s} onClick={() => setCardStyle(s)}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                cardStyle === s ? "bg-amber-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-5 rounded-2xl border-2 border-dashed border-white/10 space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Preview</p>
        <div className={`p-5 ${cardStyle === "Floating" ? "shadow-2xl shadow-indigo-500/10" : ""} ${
          cardStyle === "Sharp" ? "rounded-lg" : "rounded-2xl"
        } border border-white/10 bg-white/[0.03]`}>
          <p className="font-black text-white" style={{ fontSize: { Small:"12px", Medium:"14px", Large:"16px", "X-Large":"18px" }[fontSize] }}>
            Sample Anime Card
          </p>
          <p className="text-white/40 mt-1" style={{ fontSize: { Small:"10px", Medium:"11px", Large:"12px", "X-Large":"14px" }[fontSize] }}>
            Rating · Studio · Year
          </p>
          <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: ACCENT_COLORS.find(c=>c.id===accent)?.hex, width:"60%" }} />
        </div>
      </div>

      <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} onClick={save} disabled={saving}
        className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Appearance"}
      </motion.button>
    </div>
  )
}
