"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { 
  Edit3, 
  Camera, 
  Trophy, 
  Bookmark, 
  Flame, 
  Settings, 
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Star
} from "lucide-react"
import Image from "next/image"
import { useRef } from "react"

export default function WorldClassProfile() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const stats = [
    { label: "Archive", value: "124", icon: Bookmark, color: "text-indigo-400", sub: "Anime cataloged" },
    { label: "Momentum", value: "22", icon: Flame, color: "text-orange-500", sub: "Day watch streak" },
    { label: "Standing", value: "812", icon: Globe, color: "text-blue-400", sub: "Global percentile" },
    { label: "Trust", value: "98", icon: ShieldCheck, color: "text-emerald-400", sub: "Verification score" },
  ]

  return (
    <div ref={containerRef} className="max-w-[1400px] mx-auto space-y-16 pb-32 px-6">
      
      {/* 1. MASTER HEADER: THE INFINITY CANVAS */}
      <section className="relative min-h-[450px] flex items-end overflow-hidden rounded-[3rem] border border-white/5 bg-[#050505] shadow-2xl">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-purple-900/10 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-3.svg')] bg-cover opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 w-full p-10 md:p-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-10 bg-gradient-to-t from-black via-black/40 to-transparent">
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            {/* THE ARCHITECT AVATAR */}
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.02, rotate: -2 }}
                className="h-44 w-44 md:h-56 md:w-56 rounded-[2.5rem] p-1 bg-gradient-to-br from-indigo-500 via-white/20 to-purple-500 shadow-2xl"
              >
                <div className="relative h-full w-full rounded-[2.2rem] overflow-hidden bg-[#0a0a0a]">
                  <Image 
                    src="/assets/png/tanjiro.png" 
                    alt="Master Designer Profile" 
                    fill
                    className="object-cover object-top brightness-90 group-hover:brightness-110 transition-all duration-700"
                  />
                </div>
              </motion.div>
              <button className="absolute -bottom-2 -right-2 p-4 bg-white text-black rounded-2xl shadow-2xl hover:scale-110 transition-transform active:scale-95">
                <Camera size={20} fill="black" />
              </button>
            </div>

            {/* IDENTITY STACK */}
            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">
                    Priyanshu
                  </h1>
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                    <span className="px-4 py-1 rounded-full bg-black text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] block">
                      Elite Grade
                    </span>
                  </div>
                </motion.div>
                <p className="text-white/40 text-xl font-light tracking-wide italic">Level 20 • Visionary Curator</p>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      <Zap size={14} className="text-yellow-500" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                    +12
                  </div>
                </div>
                <span className="text-xs font-bold text-white/60 uppercase tracking-tighter">Rare Badges Earned</span>
              </div>
            </div>
          </div>

          {/* ACTION HUB */}
          <div className="flex gap-4">
            <button className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1">
              Customize Hub
            </button>
            <button className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
              <Settings size={20} className="text-white/60" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE ANALYTICS GRID (Bento Masterclass) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden p-10 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] hover:bg-zinc-900/50 transition-all duration-500"
          >
            <div className={`mb-8 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
              <stat.icon size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-white tracking-tighter">{stat.value}<span className="text-lg text-white/20 ml-1 font-medium">{stat.label === "Trust" ? "%" : ""}</span></p>
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
            <p className="mt-6 text-sm text-white/40 font-medium">{stat.sub}</p>
            
            {/* Visual Deco */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
          </motion.div>
        ))}
      </section>

      {/* 3. EXPERIENCE JOURNEY & DNA */}
      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* CHRONICLES (ACTIVITY) */}
        <div className="lg:col-span-7 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter">Chronicles</h2>
            <button className="group text-white/40 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
              Full Log <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="relative space-y-4">
            <div className="absolute left-[31px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent" />
            
            {[
              { title: "Universal Sync", sub: "One Piece Archive Updated", time: "2h", icon: Zap },
              { title: "Master Rating", sub: "Attack on Titan • 10/10 Verified", time: "1d", icon: Star },
              { title: "Deep Reading", sub: "Berserk Vol. 41 Added", time: "3d", icon: Bookmark },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-20 group cursor-pointer"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center z-10 group-hover:border-indigo-500/50 transition-all shadow-xl">
                  <item.icon size={22} className="text-indigo-400" />
                </div>
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-white/90">{item.title}</h3>
                    <p className="text-sm text-white/40 font-medium mt-1">{item.sub}</p>
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.time} ago</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ANIME DNA (GENRES) */}
        <div className="lg:col-span-5 space-y-10">
          <h2 className="text-4xl font-black tracking-tighter">Anime DNA</h2>
          <div className="p-12 rounded-[3rem] border border-white/5 bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-3xl space-y-10 relative shadow-2xl">
            <div className="absolute top-8 right-12 opacity-10">
              <Award size={80} strokeWidth={1} />
            </div>

            <div className="space-y-8">
              <DNABar label="Shonen" percent={85} colors="from-indigo-600 via-blue-500 to-cyan-400" />
              <DNABar label="Psychological" percent={64} colors="from-purple-600 via-pink-500 to-rose-400" />
              <DNABar label="Seinen" percent={42} colors="from-emerald-600 via-teal-500 to-green-400" />
              <DNABar label="Fantasy" percent={30} colors="from-orange-600 via-yellow-500 to-amber-400" />
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col gap-6">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Runtime Exposure</p>
                    <p className="text-3xl font-black text-white">1,420<span className="text-sm font-medium text-white/40 ml-1 italic">hours</span></p>
                  </div>
                  <Clock size={40} className="text-indigo-500 opacity-20" strokeWidth={1} />
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function DNABar({ label, percent, colors }: { label: string; percent: number; colors: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-sm font-black uppercase tracking-widest text-white/80">{label}</span>
        <span className="text-xs font-medium text-white/30 tracking-tighter">{percent}% saturation</span>
      </div>
      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full bg-gradient-to-r ${colors} rounded-full relative shadow-[0_0_15px_rgba(99,102,241,0.2)]`}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
        </motion.div>
      </div>
    </div>
  )
}