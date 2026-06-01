// src/components/streak/SocialCard.tsx
import { Globe, Users } from "lucide-react"

export const SocialCard = () => (
  <div className="p-8 rounded-[2.5rem] border border-border bg-surface flex flex-col justify-between h-full group hover:border-accent/30 transition-all">
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
        <Globe size={20} />
      </div>
      <div className="flex -space-x-2">
        {[1,2,3].map(i => (
          <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--app-bg)] bg-surface-2" />
        ))}
      </div>
    </div>

    <div className="mt-8 space-y-1">
      <p className="text-4xl font-black text-foreground tracking-tighter">Top 4%</p>
      <p className="text-[10px] font-black text-subtle uppercase tracking-[0.2em]">Global Consistency</p>
    </div>

    <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase italic tracking-tighter">
       <Users size={14} /> +1,240 ranking this week
    </div>
  </div>
)