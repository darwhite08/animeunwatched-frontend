"use client"

import { useState } from "react"

interface AvatarProps {
  src?: string | null
  /** Used both as the alt text and to derive the initial fallback. */
  name?: string | null
  /** Pixel size — also drives the rendered font size for the initial. Default 32. */
  size?: number
  className?: string
  /** Extra classes applied to the initial fallback wrapper (e.g. accent gradient). */
  fallbackClassName?: string
}

/**
 * Round avatar. Renders the image if `src` is non-empty and loads; otherwise
 * a circle with the first letter of `name` (or "?" if missing). Image-load
 * failures (broken Google CDN URL, etc.) also fall back to the initial.
 *
 * Uses a plain <img> instead of next/image so it works without remote-patterns
 * config on whichever subdomain renders this. Google CDN serves
 * appropriately-sized thumbnails so we don't lose much.
 */
export function Avatar({ src, name, size = 32, className = "", fallbackClassName = "" }: AvatarProps) {
  const [broken, setBroken] = useState(false)
  const showImage = !!src && !broken
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?"

  const base = `inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${className}`
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.4)) }

  if (showImage) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src!}
        alt={name ?? ""}
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`${base} object-cover`}
        style={style}
      />
    )
  }

  return (
    <span
      aria-label={name ?? "avatar"}
      className={`${base} bg-gradient-to-tr from-indigo-500 to-purple-500 font-bold text-foreground ${fallbackClassName}`}
      style={style}
    >
      {initial}
    </span>
  )
}
