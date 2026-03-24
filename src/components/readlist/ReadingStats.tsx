// src/components/readlist/ReadingStats.tsx
import { Book, CheckCircle, Clock, Zap } from "lucide-react"

export const ReadingStats = () => {
  const stats = [
    { label: "Total Series", value: "48", icon: Book, color: "text-blue-400" },
    { label: "Completed", value: "12", icon: CheckCircle, color: "text-emerald-400" },
    { label: "Avg. Pace", value: "4 Ch/Day", icon: Zap, color: "text-yellow-400" },
    { label: "Hours Read", value: "240h", icon: Clock, color: "text-purple-400" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] group hover:bg-zinc-900/50 transition-all">
          <div className={`p-3 rounded-2xl bg-black border border-white/5 w-fit mb-6 ${stat.color}`}>
            <stat.icon size={20} />
          </div>
          <p className="text-4xl font-black text-white tracking-tighter mb-1">{stat.value}</p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}