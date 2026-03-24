import { motion } from "framer-motion"

// src/components/streak/StreakHeatmap.tsx
export const StreakHeatmap = () => {
  // Mock data representing activity intensity (0-4)
  const activity = Array.from({ length: 182 }, () => Math.floor(Math.random() * 5))
  
  return (
    <div className="flex flex-wrap gap-2">
      {activity.map((level, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.005 }}
          className={`h-4 w-4 rounded-[4px] transition-all duration-300 hover:scale-150 hover:shadow-[0_0_10px_rgba(79,70,229,0.5)] cursor-crosshair
            ${level === 0 ? "bg-white/5" : ""}
            ${level === 1 ? "bg-indigo-900/30" : ""}
            ${level === 2 ? "bg-indigo-700/50" : ""}
            ${level === 3 ? "bg-indigo-500" : ""}
            ${level === 4 ? "bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.4)]" : ""}
          `}
          title={`Day ${i}: Level ${level}`}
        />
      ))}
    </div>
  )
}