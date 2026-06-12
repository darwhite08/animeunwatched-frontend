"use client"

import { useEffect, useState } from "react"
import { LayoutGrid, GalleryHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Multi-image post gallery with a viewer-controlled layout: GRID or CAROUSEL.
 * The choice is remembered per-viewer (localStorage) so it applies across posts.
 * A single image renders plainly with no toggle.
 *
 * Plain <img> on purpose — user uploads are served from a CDN host that isn't in
 * next/image's remotePatterns.
 */

type Mode = "grid" | "carousel"
const PREF_KEY = "kv_gallery_mode"

export function PostGallery({ images }: { images: string[] }) {
  const imgs = images.filter(Boolean)
  const [mode, setMode] = useState<Mode>("grid")
  const [index, setIndex] = useState(0)

  // Load the viewer's saved preference once mounted (avoids SSR mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREF_KEY)
      if (saved === "grid" || saved === "carousel") setMode(saved)
    } catch { /* ignore */ }
  }, [])

  function choose(m: Mode) {
    setMode(m)
    try { localStorage.setItem(PREF_KEY, m) } catch { /* ignore */ }
  }

  if (imgs.length === 0) return null

  // Single image — no chrome, just the image.
  if (imgs.length === 1) {
    return (
      <a href={imgs[0]} target="_blank" rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden border border-border max-w-[520px] hover:border-accent/30 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[0]} alt="Post attachment" loading="lazy" decoding="async" referrerPolicy="no-referrer"
          className="w-full h-auto object-cover max-h-[520px]" />
      </a>
    )
  }

  const clamp = (i: number) => (i + imgs.length) % imgs.length

  return (
    <div className="max-w-[520px]">
      {/* Layout toggle — the viewer picks grid or carousel; choice persists. */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-subtle tabular-nums">{imgs.length} photos</span>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface border border-border">
          <button
            type="button" onClick={() => choose("grid")} aria-label="Grid view" title="Grid"
            className={`flex items-center justify-center w-7 h-6 rounded-md transition-colors ${mode === "grid" ? "bg-accent text-black" : "text-subtle hover:text-foreground"}`}>
            <LayoutGrid size={13} />
          </button>
          <button
            type="button" onClick={() => choose("carousel")} aria-label="Carousel view" title="Carousel"
            className={`flex items-center justify-center w-7 h-6 rounded-md transition-colors ${mode === "carousel" ? "bg-accent text-black" : "text-subtle hover:text-foreground"}`}>
            <GalleryHorizontal size={13} />
          </button>
        </div>
      </div>

      {mode === "grid" ? (
        <div className={`grid gap-1 rounded-2xl overflow-hidden border border-border ${imgs.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
          {imgs.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noopener noreferrer"
              className={`relative block overflow-hidden bg-surface ${imgs.length === 3 && i === 0 ? "col-span-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} loading="lazy" decoding="async" referrerPolicy="no-referrer"
                className="w-full h-full object-cover aspect-square hover:opacity-90 transition-opacity" />
            </a>
          ))}
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-black select-none">
          <a href={imgs[index]} target="_blank" rel="noopener noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs[index]} alt={`Photo ${index + 1} of ${imgs.length}`} loading="lazy" decoding="async" referrerPolicy="no-referrer"
              className="w-full h-auto object-contain max-h-[520px] mx-auto" />
          </a>

          {/* Prev / next */}
          <button type="button" onClick={() => setIndex(clamp(index - 1))} aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => setIndex(clamp(index + 1))} aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <ChevronRight size={18} />
          </button>

          {/* Counter */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold tabular-nums">
            {index + 1}/{imgs.length}
          </div>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {imgs.map((_, i) => (
              <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Go to photo ${i + 1}`}
                className={`rounded-full transition-all ${i === index ? "w-4 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
