"use client"

import { useEffect, useState } from "react"

/**
 * Sticky "On this page" table of contents — research-backed left-rail element
 * (NN/g: lifts engagement + scanning; can earn Google scroll-to sitelinks).
 *
 * Built from the rendered DOM (`.article-content` h2/h3) so it works with the
 * auto-translated body too. Assigns slug ids to headings for jump links and
 * highlights the section in view (scroll-spy). Hidden for short articles.
 */
type Heading = { id: string; text: string; level: number }

const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64) || "section"

export function ArticleTOC() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState("")

  // Scan the rendered article for headings (retry until it has mounted).
  useEffect(() => {
    let tries = 0
    let timer: ReturnType<typeof setTimeout>
    const scan = () => {
      const root = document.querySelector(".article-content")
      const hs = root ? (Array.from(root.querySelectorAll("h2, h3")) as HTMLElement[]) : []
      if (hs.length === 0 && tries < 12) { tries++; timer = setTimeout(scan, 250); return }
      const seen = new Set<string>()
      const list: Heading[] = []
      hs.forEach((h) => {
        const text = h.textContent?.trim() ?? ""
        if (!text) return
        let id = h.id || slugify(text)
        while (seen.has(id)) id += "-2"
        seen.add(id)
        h.id = id
        h.style.scrollMarginTop = "96px"
        list.push({ id, text, level: h.tagName === "H3" ? 3 : 2 })
      })
      setHeadings(list)
    }
    timer = setTimeout(scan, 250)
    return () => clearTimeout(timer)
  }, [])

  // Highlight the heading currently in view.
  useEffect(() => {
    if (headings.length === 0) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive((e.target as HTMLElement).id) }),
      { rootMargin: "-88px 0px -72% 0px" },
    )
    headings.forEach((h) => { const el = document.getElementById(h.id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [headings])

  if (headings.length < 3) return null

  return (
    <nav aria-label="On this page" className="rounded-2xl border border-border bg-surface-2 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-subtle">On this page</p>
      <ul className="space-y-0.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                history.replaceState(null, "", `#${h.id}`)
              }}
              className={`-ml-px block border-l-2 py-1.5 text-xs leading-snug transition-colors ${h.level === 3 ? "pl-6" : "pl-3"} ${
                active === h.id
                  ? "border-accent font-bold text-accent-bright"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
