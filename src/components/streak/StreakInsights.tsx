// src/components/streak/StreakInsights.tsx
import { motion } from "framer-motion";
import { Zap, Target, TrendingUp, AlertCircle } from "lucide-react";

export const StreakInsights = () => {
  const insights = [
    {
      title: "Prime Viewing",
      value: "8:00 PM",
      desc: "Your peak consistency time.",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      title: "Next Milestone",
      value: "30 Days",
      desc: "8 days until 'Fire Walker' badge.",
      icon: Target,
      color: "text-amber-400",
    },
    {
      title: "Community Rank",
      value: "Top 4%",
      desc: "You're outpacing 96% of users.",
      icon: TrendingUp,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-black tracking-tighter px-2 italic">Neural Insights</h4>
      <div className="grid gap-4">
        {insights.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl group hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-black/40 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Verified</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-black text-white tracking-tight">{item.value}</p>
              <p className="text-xs font-bold text-white/60 uppercase tracking-tighter">{item.title}</p>
            </div>
            
            <p className="mt-4 text-[11px] text-white/30 font-medium leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}

        {/* Action Suggestion */}
        <div className="p-6 rounded-[2rem] bg-amber-600/10 border border-amber-500/20 flex items-center gap-4 group cursor-pointer hover:bg-amber-600/20 transition-all">
          <AlertCircle className="text-amber-400 shrink-0" size={20} />
          <p className="text-[11px] font-bold text-amber-200 leading-tight">
            Verify today's episode of <span className="text-white">One Piece</span> to maintain your standing.
          </p>
        </div>
      </div>
    </div>
  );
};