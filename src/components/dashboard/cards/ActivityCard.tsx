// src/components/dashboard/cards/ActivityCard.tsx
import { motion } from "framer-motion"
import { Clock, CheckCircle2 } from "lucide-react"

export const ActivityCard = () => {
  const activities = [
    { title: "Watched Ep. 24", anime: "Demon Slayer", time: "2h ago" },
    { title: "Rated 10/10", anime: "Monster", time: "1d ago" },
    { title: "Added to Archives", anime: "Vagabond", time: "3d ago" },
  ]

  return (
    <div className="p-10 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] space-y-8">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Recent Journey</h4>
        <Clock size={16} className="text-white/20" />
      </div>
      
      <div className="space-y-6">
        {activities.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex justify-between items-start group cursor-pointer"
          >
            <div className="flex gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <div>
                    <p className="font-bold text-white/90 group-hover:text-indigo-400 transition-colors">{item.title}</p>
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-tighter">{item.anime}</p>
                </div>
            </div>
            <span className="text-[10px] font-medium text-white/10 italic">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}