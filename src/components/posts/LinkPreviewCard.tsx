"use client"

import { useQuery } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"

/**
 * Rich link preview (Open Graph unfurl) for a URL inside a post — title, image,
 * description and site, fetched from /links/preview. For a Kaiveron blog link the
 * title/image come straight from the blog's OG tags.
 *
 * The unfurl endpoint requires auth, so previews render for logged-in viewers;
 * for everyone else (or on any failure) it degrades to nothing — the link still
 * lives in the post text.
 */
export function LinkPreviewCard({ url }: { url: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["link-preview", url],
    queryFn: () => ep.getLinkPreview(url),
    staleTime: 60 * 60 * 1000,
    retry: false,
  })

  if (isLoading) {
    return <div className="max-w-[520px] h-20 rounded-2xl border border-border bg-surface/40 animate-pulse" />
  }
  // Nothing usable to show → render nothing (the bare link stays in the text).
  if (!data || (!data.title && !data.image)) return null

  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, "") } catch { return data.siteName ?? "" } })()

  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow"
      className="group block max-w-[520px] overflow-hidden rounded-2xl border border-border bg-white/[0.02] transition-colors hover:border-accent/30">
      {data.image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={data.image} alt="" referrerPolicy="no-referrer" loading="lazy"
          className="aspect-[1.91/1] w-full object-cover" />
      )}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          {data.favicon && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.favicon} alt="" referrerPolicy="no-referrer" className="h-3.5 w-3.5 rounded-sm" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-widest text-subtle truncate">{data.siteName || host}</span>
        </div>
        {data.title && <div className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-accent-bright transition-colors">{data.title}</div>}
        {data.description && <div className="mt-1 text-xs text-muted line-clamp-2">{data.description}</div>}
      </div>
    </a>
  )
}

/** First http(s) URL in a string, with trailing punctuation trimmed. null if none. */
export function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s<]+/i)
  if (!m) return null
  return m[0].replace(/[.,;:!?)\]]+$/, "")
}
