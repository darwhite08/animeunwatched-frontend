"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, MessageSquare, Globe, Radio, Terminal, Flame, BookOpen, ArrowRight, ShieldAlert } from "lucide-react";

// Upgraded mock data to match the Cyberpunk/Neural lore
const LIVE_STREAM = [
  { id: "LOG_892", user: "User_77", action: "Achieved 100-Day Streak", target: "System_Core", time: "0.02s ago", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "LOG_891", user: "Otaku_Arch", action: "Archived Masterpiece", target: "'Monster'", time: "1.4s ago", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "LOG_890", user: "Shinobi_X", action: "Cast Global Vote", target: "'Studio MAPPA'", time: "3.2s ago", icon: ShieldAlert, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "LOG_889", user: "Neural_Bot", action: "Oracle Engine Update", target: "Algorithm v4.2", time: "12.0s ago", icon: Terminal, color: "text-white/60", bg: "bg-white/5" },
];

export default function CommunityPulse() {
  return (
    <section className="relative py-40 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020202]">
      
      {/* 1. ARCHITECTURAL BACKGROUND & RADAR SWEEP */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radar/Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
        
        {/* Core Glowing Orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-16">
        
        {/* 2. SECTION HEADER (Cinematic Scale) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400"
            >
              <Radio size={14} className="animate-pulse" /> Global Uplink Active
            </motion.div>
            <h2 className="text-6xl md:text-[5.5rem] font-black tracking-tighter text-white leading-[0.85] uppercase italic">
              The Dojo <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                Pulse.
              </span>
            </h2>
          </div>
          <div className="text-right hidden md:block">
             <p className="text-[10px] font-mono tracking-[0.3em] text-white/20 uppercase mb-2">Live Connections</p>
             <p className="text-3xl font-black text-white tracking-tighter font-mono">12,402<span className="text-emerald-500 animate-pulse">_</span></p>
          </div>
        </div>

        {/* 3. THE ASYMMETRICAL DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          {/* LEFT: THE LIVE FEED TIMELINE (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 relative p-8 md:p-12 rounded-[2.5rem] bg-[#080808]/80 backdrop-blur-2xl border border-white/10 overflow-hidden group"
          >
            {/* Feed Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <h3 className="text-sm font-black text-white/60 uppercase tracking-[0.3em]">Transmission_Log</h3>
              <Activity size={18} className="text-amber-500" />
            </div>

            {/* Glowing Hardware Timeline */}
            <div className="relative pl-8 md:pl-10 space-y-8 relative z-10">
              {/* The Line */}
              <div className="absolute top-2 bottom-0 left-[11px] md:left-[19px] w-px bg-gradient-to-b from-indigo-500 via-white/10 to-transparent" />

              {LIVE_STREAM.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative group/item cursor-pointer"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[37px] md:-left-[45px] top-1 h-3 w-3 rounded-full border-2 border-[#080808] ${event.bg} ${event.color} ring-1 ring-white/10 group-hover/item:scale-150 transition-transform duration-300 shadow-[0_0_10px_currentColor]`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-transparent hover:bg-white/[0.02] hover:border-white/5 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${event.bg} ${event.color} border border-white/5`}>
                        <event.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/40 leading-tight">
                          <span className="text-white font-bold">{event.user}</span> {event.action}
                        </p>
                        <p className="text-sm font-black text-amber-400 italic uppercase tracking-tighter mt-0.5">
                          {event.target}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">{event.time}</span>
                      <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1 hidden sm:block">{event.id}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Fade Out Gradient at bottom of feed */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
          </motion.div>

          {/* RIGHT: COMMAND MODULES (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Top Module: Global Diagnostics */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1 p-8 md:p-10 rounded-[2.5rem] bg-[#080808]/80 backdrop-blur-2xl border border-white/10 group hover:border-amber-500/30 transition-colors duration-500 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-white/[0.02] group-hover:text-white/[0.05] transition-colors duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                  <Globe size={180} strokeWidth={1} />
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2 mb-6">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                   <span className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">Census_Data</span>
                </div>
                <p className="text-[3.5rem] font-black text-white tracking-tighter leading-none mix-blend-plus-lighter">
                  142,802
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Total Archives Logged</p>
                  <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">+2.4% / HR</p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Module: Action Trigger */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-800 border border-amber-500/30 relative overflow-hidden group cursor-pointer shadow-[0_20px_50px_rgba(79,70,229,0.15)]"
            >
              {/* Hover Light Sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              
              <div className="relative z-10 space-y-8">
                 <div className="p-3 rounded-xl bg-white/10 border border-white/20 w-fit backdrop-blur-md">
                   <MessageSquare size={20} className="text-white" />
                 </div>
                 
                 <div className="space-y-3">
                   <h4 className="text-3xl font-black tracking-tighter italic text-white leading-none">
                     Join the Global <br/> Consensus.
                   </h4>
                   <p className="text-amber-100/70 text-sm font-medium leading-relaxed max-w-[240px]">
                     Influence the seasonal Hall of Fame and forge your standing in the Dojo.
                   </p>
                 </div>

                 <Link href="/community" className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10 group-hover:border-white/20">
                   <span>Enter Community</span>
                   <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}