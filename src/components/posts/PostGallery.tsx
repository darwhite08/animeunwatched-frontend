"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Multi-image post gallery. The LAYOUT (grid or carousel) is the author's choice,
 * set when they create the post — viewers don't toggle it. A single image renders
 * plainly.
 *
 * Plain <img> on purpose — user uploads are served from a CDN host that isn't in
 * next/image's remotePatterns.
 */
export function PostGallery({ images, layout = "grid" }: { images: string[]; layout?: "grid" | "carousel" }) {
  const imgs = images.filter(Boolean)
  const [index, setIndex] = useState(0)

  if (imgs.length === 0) return null

  // Single image — no chrome.
  if (imgs.length === 1) {
    return (
      <a href={imgs[0]} target="_blank" rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden border border-border max-w-[520px] hover:border-white/30 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[0]} alt="Post attachment" loading="lazy" decoding="async" referrerPolicy="no-referrer"
          className="w-full h-auto object-cover max-h-[520px]" />
      </a>
    )
  }

  const clamp = (i: number) => (i + imgs.length) % imgs.length

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-border max-w-[520px]">
        {imgs.map((src, i) => (
          <a key={i} href={src} target="_blank" rel="noopener noreferrer"
            className={`relative block overflow-hidden bg-surface ${imgs.length === 3 && i === 0 ? "col-span-2" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} loading="lazy" decoding="async" referrerPolicy="no-referrer"
              className="w-full h-full object-cover aspect-square hover:opacity-90 transition-opacity" />
          </a>
        ))}
      </div>
    )
  }

  // Carousel
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-black max-w-[520px] select-none">
      <a href={imgs[index]} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[index]} alt={`Photo ${index + 1} of ${imgs.length}`} loading="lazy" decoding="async" referrerPolicy="no-referrer"
          className="w-full h-auto object-contain max-h-[520px] mx-auto" />
      </a>

      <button type="button" onClick={() => setIndex(clamp(index - 1))} aria-label="Previous photo"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors">
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={() => setIndex(clamp(index + 1))} aria-label="Next photo"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors">
        <ChevronRight size={18} />
      </button>

      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold tabular-nums">
        {index + 1}/{imgs.length}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {imgs.map((_, i) => (
          <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Go to photo ${i + 1}`}
            className={`rounded-full transition-all ${i === index ? "w-4 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"}`} />
        ))}
      </div>
    </div>
  )
}
