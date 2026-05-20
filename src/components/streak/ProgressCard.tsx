// src/components/streak/ProgressCard.tsx
import { motion } from "framer-motion"
import { Target } from "lucide-react"

export const ProgressCard = () => (
  <div className="relative overflow-hidden p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/20 backdrop-blur-3xl group">
    {/* Background Glow */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 blur-[60px] rounded-full group-hover:bg-purple-500/30 transition-all" />

    <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Next Evolution</p>
          <h4 className="text-xl font-black text-white italic">Elite Watcher</h4>
        </div>
        <Target className="text-white/20" size={24} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-white/40">Progress</span>
          <span className="text-white">78%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "78%" }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>

      <p className="text-[11px] text-white/30 font-medium italic leading-tight">
        Keep your streak for 4 more days to unlock the "Shinobi" badge and double XP.
      </p>
    </div>
  </div>
)