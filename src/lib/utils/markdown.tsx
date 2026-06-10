"use client"

import DOMPurify from "isomorphic-dompurify"

/**
 * Centralized rich-content rendering for blog bodies authored in the Creator
 * Studio (TipTap → HTML). All sanitization + the only `dangerouslySetInnerHTML`
 * in the app live here. YouTube embeds are allowed but locked to youtube hosts;
 * everything else is scrubbed by DOMPurify.
 */

const YT_SRC = /^https:\/\/(www\.)?(youtube(-nocookie)?\.com|youtu\.be)\//i

let hooked = false
function ensureHooks() {
  if (hooked) return
  hooked = true
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
      const el = node as Element
      const src = el.getAttribute("src") || ""
      if (!YT_SRC.test(src)) el.parentNode?.removeChild(el)
    }
  })
  // Make article images robust + fast: no-referrer dodges hotlink blocks (MAL
  // CDN, catbox, etc.), lazy/async keeps long posts snappy.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName === "IMG") {
      const el = node as Element
      el.setAttribute("referrerpolicy", "no-referrer")
      el.setAttribute("loading", "lazy")
      el.setAttribute("decoding", "async")
    }
  })
}

export function sanitizeBlogHtml(html: string): string {
  ensureHooks()
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel", "start",
      "data-youtube-video", "data-link-preview", "data-url", "data-title", "data-description", "data-image", "data-site",
      "colspan", "rowspan", "style", "referrerpolicy", "loading", "decoding",
    ],
  })
}

/** Heuristic: does this body contain real HTML markup (new editor) vs plain text (legacy)? */
export function looksLikeHtml(s: string): boolean {
  return /<\/?(p|h[1-6]|ul|ol|li|blockquote|pre|img|iframe|a|strong|em|table|div|mark|br|hr)\b[^>]*>/i.test(s)
}

/** Renders sanitized blog HTML with article typography (`.article-content`). */
export function RichArticle({ html }: { html: string }) {
  return <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }} />
}
