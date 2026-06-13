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
        className="flex min-h-11 items-center justify-between w-full mb-2 group"
      >
        <span className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">{title}</span>
        <ChevronDown size={16} className={`text-subtle transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="flex flex-col">
          {options.map((opt) => {
            const checked = selected.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.id)}
                className="flex min-h-11 items-center gap-3 cursor-pointer group text-left active:scale-[0.98] transition-transform"
              >
                <span
                  className={`relative h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    checked ? "bg-accent border-accent" : "bg-surface border-border group-hover:border-accent/50"
                  }`}
                >
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm font-medium transition-colors ${checked ? "text-foreground" : "text-muted group-hover:text-foreground"}`}
                >
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
