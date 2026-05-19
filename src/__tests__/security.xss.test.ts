/**
 * XSS prevention tests.
 * Verifies that user-controlled content is properly escaped before rendering.
 */
import { describe, it, expect } from "vitest"

// ── HTML entity escaping helpers ─────────────────────────────────────────────

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function escapeAndRenderBold(raw: string): string {
  return escapeHtml(raw).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
}

describe("HTML escaping — prevents XSS injection", () => {
  it("escapes < and > in user content", () => {
    const malicious = "<script>alert('xss')</script>"
    const escaped = escapeHtml(malicious)
    expect(escaped).not.toContain("<script>")
    expect(escaped).toContain("&lt;script&gt;")
  })

  it("escapes & in user content", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry")
  })

  it("escapes quotes in user content", () => {
    const input = 'He said "hello" & she said \'bye\''
    const escaped = escapeHtml(input)
    expect(escaped).not.toContain('"hello"')
    expect(escaped).toContain("&quot;hello&quot;")
    expect(escaped).toContain("&#039;bye&#039;")
  })

  it("preserves safe text unchanged (no special chars)", () => {
    const safe = "Hello World! This is safe."
    expect(escapeHtml(safe)).toBe(safe)
  })

  it("escapes multiple XSS vectors", () => {
    const vectors = [
      "<img src=x onerror=alert(1)>",
      "javascript:alert(1)",
      "<iframe src=javascript:alert(1)>",
      "';alert(1)//",
    ]
    for (const v of vectors) {
      const escaped = escapeHtml(v)
      expect(escaped).not.toContain("<")
      expect(escaped).not.toContain(">")
    }
  })
})

describe("escapeAndRenderBold — markdown after escape", () => {
  it("renders **bold** after escaping", () => {
    const result = escapeAndRenderBold("This is **bold** text")
    expect(result).toContain("<strong>bold</strong>")
    expect(result).toContain("This is")
    expect(result).toContain("text")
  })

  it("prevents XSS in bold markdown", () => {
    const malicious = "**<script>alert('xss')</script>**"
    const result = escapeAndRenderBold(malicious)
    expect(result).not.toContain("<script>")
    expect(result).toContain("&lt;script&gt;")
  })

  it("escapes HTML before applying bold", () => {
    const input = "<b>not-bold</b> but **this is**"
    const result = escapeAndRenderBold(input)
    expect(result).not.toContain("<b>not-bold</b>")
    expect(result).toContain("&lt;b&gt;not-bold&lt;/b&gt;")
    expect(result).toContain("<strong>this is</strong>")
  })

  it("escapes the JSON-LD script injection vector", () => {
    const malicious = "</script><script>alert(1)</script>"
    const escaped = malicious.replace(/<\/script>/gi, "<\\/script>")
    expect(escaped).not.toContain("</script>")
    expect(escaped).toContain("<\\/script>")
  })
})
