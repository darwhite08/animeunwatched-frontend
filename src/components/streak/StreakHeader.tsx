// src/components/streak/StreakHeader.tsx
import { motion } from "framer-motion";
import { Award, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const StreakHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 min-h-11 -ml-1 px-1 text-muted hover:text-foreground active:scale-95 transition-all text-xs font-black uppercase tracking-[0.2em] mb-2"
        >
          <ChevronLeft size={14} /> Back to Hub
        </Link>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-foreground">
          Momentum<span style={{color:"var(--app-accent)"}}>.</span>
        </h1>
        <p className="text-muted text-base sm:text-lg font-medium tracking-wide">
          Your daily consistency and verification history.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-surface border border-border p-4 rounded-3xl backdrop-blur-md">
        <div className="h-12 w-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent-bright">
          <Award size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Current Rank</p>
          <p className="text-foreground font-black italic">SHINOBI GRADE II</p>
        </div>
      </div>
    </div>
  );
};