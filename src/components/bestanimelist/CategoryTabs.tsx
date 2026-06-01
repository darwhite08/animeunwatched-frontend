"use client"

import { motion } from "framer-motion"
import { categories } from "./filterData"

interface CategoryTabsProps {
  active: string
  onChange: (id: string) => void
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className="relative flex items-center justify-center px-5 py-2 group outline-none shrink-0"
        >
          {/* Background renders BEHIND the label */}
          {active === cat.id && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className={`relative z-10 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${
            active === cat.id ? "text-foreground" : "text-muted group-hover:text-muted"
          }`}>
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  )
}
