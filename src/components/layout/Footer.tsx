"use client"

import { motion } from "framer-motion"
import { Github, Twitter, Disc as Discord, Zap, ShieldCheck } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#050505] py-12 px-10 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        
        {/* BRAND & STATUS */}
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Zap size={16} className="text-indigo-500" fill="currentColor" />
            </div>
            <span className="text-sm font-black tracking-[0.3em] text-white uppercase">
              Unwatched<span className="text-indigo-500">.</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 justify-center md:justify-start">
            <ShieldCheck size={12} className="text-emerald-500/50" /> System Integrity: Optimal • v2.4.0
          </p>
        </div>

        {/* SOCIAL LINKS */}
        <div className="flex items-center gap-4">
          <SocialIcon icon={Github} href="https://github.com" />
          <SocialIcon icon={Discord} href="https://discord.com" />
          <SocialIcon icon={Twitter} href="https://twitter.com" />
        </div>

        {/* COPYRIGHT & LEGAL */}
        <div className="text-center md:text-right space-y-2">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            © {currentYear} Shinobi Archives • All Rights Reserved
          </p>
          <div className="flex gap-6 justify-center md:justify-end text-[9px] font-bold text-white/10 uppercase tracking-tighter">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      whileHover={{ y: -3, backgroundColor: "rgba(255,255,255,0.05)" }}
      className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:border-indigo-500/30 transition-all"
    >
      <Icon size={18} />
    </motion.a>
  )
}