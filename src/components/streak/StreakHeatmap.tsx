"use client"

import { motion } from "framer-motion";

export const StreakHeatmap = () => {
  // Generates 182 days (approx 6 months) of activity
  const data = Array.from({ length: 182 }, (_, i) => ({
    day: i,
    intensity: Math.floor(Math.random() * 5), // 0 to 4
  }));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] font-black text-subtle uppercase tracking-widest px-1">
        {months.map(m => <span key={m}>{m}</span>)}
      </div>
      
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {data.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.002 }}
            whileHover={{ scale: 1.5, zIndex: 50 }}
            className={`h-3.5 w-3.5 md:h-4 md:w-4 rounded-[4px] cursor-pointer transition-colors duration-500 shadow-sm
              ${d.intensity === 0 ? "bg-surface hover:bg-white/20" : ""}
              ${d.intensity === 1 ? "bg-indigo-900/40" : ""}
              ${d.intensity === 2 ? "bg-indigo-700/60" : ""}
              ${d.intensity === 3 ? "bg-accent" : ""}
              ${d.intensity === 4 ? "bg-accent-bright shadow-[0_0_15px_rgba(251,191,36,0.5)]" : ""}
            `}
          />
        ))}
      </div>
    </div>
  );
};