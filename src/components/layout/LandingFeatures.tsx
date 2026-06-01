"use client";

import { motion } from "framer-motion";
import { Sparkles, Flame, ShieldCheck, Target, Terminal, Fingerprint, Activity } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

const FEATURES = [
  {
    id: "SYS_01",
    title: "AI Oracle Network",
    desc: "Our proprietary neural engine doesn't just suggest; it predicts. By analyzing your 'Anime DNA,' the Oracle unearths hidden masterpieces tailored to your exact psychological profile.",
    tags: ["Predictive_Scoring", "DNA_Mapping", "Seasonal_Forecast"],
    icon: Sparkles,
    glow: "group-hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.4)]",
    border: "group-hover:border-accent/50",
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    iconColor: "text-accent-bright",
    span: "md:col-span-8",
  },
  {
    id: "MOD_02",
    title: "Shinobi Streaks",
    desc: "Consistency is the mark of a master. Track your daily logs with flawless precision and forge your legacy.",
    tags: ["Flame_Grading", "Heatmap_Sync"],
    icon: Flame,
    glow: "group-hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.4)]",
    border: "group-hover:border-orange-500/50",
    gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
    iconColor: "text-orange-500",
    span: "md:col-span-4",
  },
  {
    id: "MOD_03",
    title: "The Dojo Standings",
    desc: "Compete in the global census. Rise from a Novice to a Legendary Shinobi in the community Hall of Fame.",
    tags: ["Global_Rank", "Tier_Ascension"],
    icon: Target,
    glow: "group-hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]",
    border: "group-hover:border-emerald-500/50",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconColor: "text-emerald-400",
    span: "md:col-span-4",
  },
  {
    id: "SYS_04",
    title: "The Vault Protocol",
    desc: "Your history is sacred. We provide a military-grade, encrypted archive for your entire viewing legacy, accessible instantly across all transmissions.",
    tags: ["Cross_Device", "Offline_Archive", "One_Click_Import"],
    icon: ShieldCheck,
    glow: "group-hover:shadow-[0_0_60px_-15px_rgba(56,189,248,0.4)]",
    border: "group-hover:border-sky-500/50",
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
    iconColor: "text-sky-400",
    span: "md:col-span-8",
  }
];

export default function LandingFeatures() {
  return (
    <section className="relative py-40 px-6 w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      
      {/* 1. BACKGROUND ARCHITECTURE */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in srgb, var(--app-fg) 3%, transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in srgb, var(--app-fg) 3%, transparent)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,var(--app-bg)_20%,transparent_100%)]" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-24">
        
        {/* 2. SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6 max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-[10px] font-black uppercase tracking-[0.4em] text-muted"
            >
              <Terminal size={14} className="text-emerald-500" /> System Capabilities // v4.0
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter text-foreground leading-[0.85] uppercase italic"
            >
              Engineered for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                The Elite 1%.
              </span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted text-lg font-medium leading-relaxed max-w-sm uppercase tracking-tight"
          >
            We’ve stripped away the noise of traditional trackers to build a high-fidelity protocol for true enthusiasts.
          </motion.p>
        </div>

        {/* 3. BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {FEATURES.map((f, i) => (
            <TiltCard key={f.id} intensity={5} glare className={f.span}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-border overflow-hidden transition-all duration-700 w-full ${f.border} ${f.glow}`}
            >
              {/* Internal Holographic Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
              
              {/* Animated Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700" />

              <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
                
                {/* Header: ID + Icon */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-black text-subtle group-hover:text-muted tracking-[0.2em] transition-colors">
                    [{f.id}]
                  </span>
                  <div className={`p-4 rounded-2xl bg-surface border border-border group-hover:bg-background group-hover:border-transparent transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${f.iconColor}`}>
                    <f.icon size={28} strokeWidth={2} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic group-hover:translate-x-2 transition-transform duration-500">
                      {f.title}
                    </h3>
                    <p className="text-muted text-sm md:text-base leading-relaxed font-medium max-w-md group-hover:text-muted transition-colors duration-500">
                      {f.desc}
                    </p>
                  </div>

                  {/* Neural Tags */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    {f.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border text-[9px] font-mono font-black uppercase tracking-widest text-subtle group-hover:bg-surface group-hover:text-muted transition-all duration-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watermark Icon */}
              <div className="absolute -bottom-10 -right-10 text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                  <Fingerprint size={180} strokeWidth={1} />
              </div>
            </motion.div>
            </TiltCard>
          ))}
        </div>

        {/* 4. SERVER STATUS STRIP */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-border relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          
          <StatItem label="Active Shinobi" value="12,402" color="text-emerald-500" />
          <StatItem label="Archives Logged" value="1.2M" color="text-accent-bright" />
          <StatItem label="Oracle Precision" value="98.4%" color="text-sky-400" />
          <StatItem label="System Uptime" value="99.9%" color="text-orange-500" isStatus />
        </div>

      </div>
    </section>
  );
}

function StatItem({ label, value, color, isStatus = false }: { label: string; value: string, color: string, isStatus?: boolean }) {
  return (
    <div className="space-y-2 group cursor-default">
      <div className={`text-4xl md:text-5xl font-black font-mono tracking-tighter text-foreground group-hover:${color} transition-colors duration-500 flex items-center gap-2`}>
        {isStatus && <Activity size={24} className={`${color} animate-pulse`} />}
        {value}
      </div>
      <p className="text-[10px] font-black text-subtle uppercase tracking-[0.3em] group-hover:text-muted transition-colors">
        {label}
      </p>
    </div>
  );
}