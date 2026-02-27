"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function FilterSection({
  title,
  children,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm text-white/60 hover:text-white transition"
      >
        <span>{title}</span>
        <span className="text-xs">
          {open ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}