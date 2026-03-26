"use client"

import { motion } from "framer-motion"
import { Activity, Users, MessageSquare, TrendingUp, Globe } from "lucide-react"

const RECENT_EVENTS = [
  { user: "User_77", action: "reached a 100-day streak", time: "2m ago", icon: "🔥" },
  { user: "Otaku_Arch", action: "archived 'Monster'", time: "5m ago", icon: "📚" },
  { user: "Shinobi_X", action: "voted in 'Best Studio'", time: "12m ago", icon: "🗳️" },
]

export default function CommunityPulse() {
  return (
    <section className="py-32 px-8 max-w-[1440px] mx-auto relative overflow-hidden bg-black">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* 1. THE LIVE FEED (6 Cols) */}
        <div className="lg:col-span-6 p-10 rounded-[3rem] border border-white/5 bg-[#080808] space-y-8 flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Transmission
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              The Dojo <br /><span className="text-indigo-500">Pulse.</span>
            </h3>
          </div>

          <div className="space-y-4 mt-12">
            {RECENT_EVENTS.map((event, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{event.icon}</span>
                  <p className="text-sm font-medium text-white/60">
                    <span className="text-white font-black">{event.user}</span> {event.action}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{event.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. TRENDING POLL PREVIEW (6 Cols) */}
        <div className="lg:col-span-6 grid grid-rows-2 gap-8">
          
          {/* Top Row: Global Stats */}
          <div className="p-10 rounded-[3rem] border border-white/5 bg-[#080808] flex flex-col justify-center items-center text-center space-y-2 group hover:border-indigo-500/30 transition-all">
            <Globe className="text-indigo-500 mb-4 opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all" size={40} />
            <p className="text-5xl font-black text-white tracking-tighter">142,802</p>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Total Episodes Logged</p>
          </div>

          {/* Bottom Row: Community Interaction CTA */}
          <div className="p-10 rounded-[3rem] bg-indigo-600 flex flex-col justify-between items-start group overflow-hidden relative shadow-2xl shadow-indigo-600/20">
             {/* Decorative pattern */}
             <Activity className="absolute -right-8 -bottom-8 text-white/10 w-48 h-48 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
             
             <div className="space-y-2 relative z-10">
                <div className="p-2 rounded-lg bg-white/20 w-fit"><MessageSquare size={18} /></div>
                <h4 className="text-2xl font-black tracking-tighter italic">Join the Global Consensus</h4>
             </div>
             <p className="text-indigo-100/70 text-sm font-medium leading-relaxed relative z-10 max-w-[240px]">
               Participate in weekly polls and influence the seasonal hall of fame.
             </p>
             <button className="mt-6 px-8 py-3 rounded-xl bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 relative z-10">
               Enter Community
             </button>
          </div>

        </div>
      </div>
    </section>
  )
}