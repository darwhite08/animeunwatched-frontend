"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function FilterCheckboxGroup({ title, options }: { title: string; options: any[] }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border-b border-white/5 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{title}</span>
        <ChevronDown size={14} className={`text-white/20 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="space-y-3">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative h-4 w-4 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                <div className="h-2 w-2 rounded-sm bg-indigo-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-xs font-medium text-white/40 group-hover:text-white transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}