"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface Option { id: string; label: string }

interface Props {
  title: string
  options: Option[]
  selected: string[]
  onChange: (id: string) => void
}

export function FilterCheckboxGroup({ title, options, selected, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border-b border-border py-6">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <span className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">{title}</span>
        <ChevronDown size={14} className={`text-subtle transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="space-y-3">
          {options.map((opt) => {
            const checked = selected.includes(opt.id)
            return (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`relative h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    checked ? "bg-accent border-accent" : "bg-surface border-border group-hover:border-accent/50"
                  }`}
                  onClick={() => onChange(opt.id)}
                >
                  {checked && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${checked ? "text-foreground" : "text-muted group-hover:text-foreground"}`}
                  onClick={() => onChange(opt.id)}
                >
                  {opt.label}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
