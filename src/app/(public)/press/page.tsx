import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Download, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Press Kit | Kaiveron",
  description: "Media resources, brand assets, and press contact for Kaiveron.",
}

const STATS = [
  { value: "12,402", label: "Monthly Active Users" },
  { value: "1.2M+",  label: "Anime Archives Logged" },
  { value: "3,842",  label: "Community Reviews" },
  { value: "76",     label: "Platform Pages" },
]

const PRESS = [
  { date: "May 2026",   title: "Kaiveron launches Neural Oracle AI discovery engine", type: "Product Launch" },
  { date: "Apr 2026",   title: "Community reaches 10,000 active Shinobi milestone",         type: "Milestone"      },
  { date: "Mar 2026",   title: "Creator Studio opens to all users with blog and poll tools", type: "Feature"        },
  { date: "Feb 2026",   title: "Kaiveron v3.0 — Full platform rebuild",               type: "Major Release"  },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-16">

        {/* Header */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-3">Media</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-none mb-3">
            Press Kit<span style={{color:"#f59e0b"}}>.</span>
          </h1>
          <p className="text-white/35 text-sm max-w-xl">
            Resources for journalists and media covering Kaiveron. For press inquiries, contact us at press@kaiveron.app.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 text-center">
              <p className="text-2xl font-black tracking-tighter text-white">{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Brand */}
        <div className="space-y-5">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Brand Assets</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {["Logo (SVG)", "Logo (PNG Dark)", "Logo (PNG Light)"].map(item => (
              <div key={item} className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-amber-400" />
                  <span className="text-sm font-bold text-white/70">{item}</span>
                </div>
                <button className="p-2 rounded-lg bg-indigo-600/10 text-amber-400 hover:bg-indigo-600/20 transition-colors">
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Brand Colors</p>
            <div className="flex gap-3">
              {[
                { color: "#4f46e5", name: "Indigo 600", hex: "#4f46e5" },
                { color: "#7c3aed", name: "Violet 600", hex: "#7c3aed" },
                { color: "#020202", name: "Neural Black", hex: "#020202" },
                { color: "#ffffff", name: "Pure White", hex: "#ffffff" },
              ].map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-white/20" style={{ backgroundColor: c.color }} />
                  <div>
                    <p className="text-[9px] font-black text-white/60">{c.name}</p>
                    <p className="text-[8px] font-mono text-white/30">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Press releases */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Press Releases</h2>
          {PRESS.map(p => (
            <div key={p.title} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors">
              <div className="shrink-0">
                <p className="text-[9px] font-mono text-white/25 uppercase">{p.date}</p>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-amber-400 border border-indigo-500/20">{p.type}</span>
              </div>
              <p className="text-sm font-bold text-white/70 flex-1">{p.title}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="p-7 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between gap-6">
          <div>
            <p className="font-black text-white mb-1">Press Contact</p>
            <p className="text-sm text-white/50">For interviews, fact-checking, and media inquiries</p>
          </div>
          <Link href="/contact" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all shrink-0">
            <Mail size={13} /> Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
