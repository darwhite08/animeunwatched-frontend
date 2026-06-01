// src/components/streak/RoutineCard.tsx
import { motion } from "framer-motion"
import { Clock } from "lucide-react"

export const RoutineCard = () => {
  const hourlyData = [20, 40, 10, 5, 15, 80, 95, 40, 30, 10, 5, 2] // Mock intensity

  return (
    <div className="p-8 rounded-[2.5rem] border border-border bg-surface shadow-2xl space-y-6 group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/10 text-accent-bright">
          <Clock size={18} />
        </div>
        <h4 className="text-sm font-black uppercase tracking-widest text-muted">Peak Activity</h4>
      </div>

      <div className="h-32 flex items-end gap-1 px-2">
        {hourlyData.map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
            className={`flex-1 rounded-t-sm transition-colors duration-500
              ${height > 70 ? "bg-accent" : "bg-surface group-hover:bg-white/20"}
            `}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-[10px] font-bold text-subtle uppercase tracking-tighter">
        <span>Morning</span>
        <span>Evening</span>
      </div>
    </div>
  )
}