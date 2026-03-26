"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { categories } from "./filterData"

export default function CategoryTabs() {
  const [active, setActive] = useState("all")

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActive(cat.id)}
          className="relative px-6 py-2 group outline-none"
        >
          <span className={`relative z-10 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${
            active === cat.id ? "text-white" : "text-white/40 group-hover:text-white/70"
          }`}>
            {cat.label}
          </span>
          {active === cat.id && (
            <motion.div 
              layoutId="tab-bg"
              className="absolute inset-0 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}