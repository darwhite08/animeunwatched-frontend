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
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-16">

        {/* Header */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-3">Media</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-3">
            Press Kit<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
          <p className="text-subtle text-sm max-w-xl">
            Resources for journalists and media covering Kaiveron. For press inquiries, contact us at press@kaiveron.app.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="p-5 rounded-2xl bg-surface border border-border text-center">
              <p className="text-2xl font-black tracking-tighter text-foreground">{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-subtle mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Brand */}
        <div className="space-y-5">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Brand Assets</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {["Logo (SVG)", "Logo (PNG Dark)", "Logo (PNG Light)"].map(item => (
              <a
                key={item}
                href="mailto:press@kaiveron.com?subject=Brand%20Assets%20Request"
                className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between hover:border-accent/30 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-accent-bright" />
                  <span className="text-sm font-bold text-muted">{item}</span>
                </div>
                <span className="p-2 rounded-lg bg-accent/10 text-accent-bright hover:bg-accent/20 transition-colors">
                  <Download size={13} />
                </span>
              </a>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Brand Colors</p>
            <div className="flex gap-3">
              {[
                { color: "#4f46e5", name: "Indigo 600", hex: "#4f46e5" },
                { color: "#7c3aed", name: "Violet 600", hex: "#7c3aed" },
                { color: "var(--app-bg)", name: "Neural Black", hex: "var(--app-bg)" },
                { color: "var(--app-fg)", name: "Pure White", hex: "var(--app-fg)" },
              ].map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: c.color }} />
                  <div>
                    <p className="text-[9px] font-black text-muted">{c.name}</p>
                    <p className="text-[8px] font-mono text-subtle">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Press releases */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Press Releases</h2>
          {PRESS.map(p => (
            <div key={p.title} className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-border hover:border-border transition-colors">
              <div className="shrink-0">
                <p className="text-[9px] font-mono text-subtle uppercase">{p.date}</p>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent-bright border border-accent/20">{p.type}</span>
              </div>
              <p className="text-sm font-bold text-muted flex-1">{p.title}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="p-7 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-between gap-6">
          <div>
            <p className="font-black text-foreground mb-1">Press Contact</p>
            <p className="text-sm text-muted">For interviews, fact-checking, and media inquiries</p>
          </div>
          <Link href="/contact" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all shrink-0">
            <Mail size={13} /> Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
