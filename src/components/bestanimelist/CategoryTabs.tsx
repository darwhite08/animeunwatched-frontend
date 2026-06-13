"use client"

import { motion } from "framer-motion"
import { SPRING } from "@/lib/design/tokens"
import { categories } from "./filterData"

interface CategoryTabsProps {
  active: string
  onChange: (id: string) => void
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1 py-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className="relative flex min-h-11 items-center justify-center whitespace-nowrap px-5 py-2 group outline-none shrink-0 transition-transform active:scale-95"
        >
          {/* Background renders BEHIND the label */}
          {active === cat.id && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 0 20px color-mix(in srgb, var(--app-accent) 40%, transparent)" }}
              transition={SPRING.snappy}
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
