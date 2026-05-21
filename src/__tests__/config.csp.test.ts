/**
 * CSP + Security headers regression tests.
 *
 * These tests codify the exact bugs that broke production:
 *  1. connect-src missing the Render backend URL → Socket.io blocked by CSP
 *  2. Permissions-Policy camera=() microphone=() → getUserMedia() denied for everyone
 *  3. Socket fallback URL was localhost:4000 in production
 *
 * If any of these fail, the fix has been re-introduced — do not merge.
 */
import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

// process.cwd() is always the project root in Vitest
const ROOT = process.cwd()

const nextConfigRaw = readFileSync(join(ROOT, "next.config.ts"), "utf-8")
const socketRaw     = readFileSync(join(ROOT, "src/lib/socket.ts"), "utf-8")

// ── helpers ───────────────────────────────────────────────────────────────────

/** Remove // line comments without touching URL protocols (http://, wss://, etc.) */
function stripLineComments(src: string): string {
  return src
    .split("\n")
    .map(line => {
      // Only strip if `//` appears after non-URL context
      // Heuristic: skip if the `//` is immediately after a colon (http://, wss://)
      const idx = line.search(/(?<!:)\/\//)
      return idx >= 0 ? line.slice(0, idx) : line
    })
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")  // remove block comments
}

const nextConfig = stripLineComments(nextConfigRaw)
const socketCode = stripLineComments(socketRaw)

// ── connect-src ───────────────────────────────────────────────────────────────

describe("CSP connect-src — Render backend URL must be explicitly allowed", () => {

  it("file defines RENDER_BACKEND constant pointing to kaiveron-backend.onrender.com", () => {
    // This constant is used in the connect-src template literal.
    // If it's missing, the CSP won't allow socket connections to the backend.
    expect(nextConfigRaw).toContain("kaiveron-backend.onrender.com")
  })

  it("connect-src includes wss: wildcard for WebSocket upgrade", () => {
    const m = nextConfigRaw.match(/connect-src[\s\S]{0,400}?(?=";|`,)/)
    expect(m?.[0] ?? "").toContain("wss:")
  })

  it("connect-src includes ws: for local dev WebSocket", () => {
    const m = nextConfigRaw.match(/connect-src[\s\S]{0,400}?(?=";|`,)/)
    expect(m?.[0] ?? "").toContain("ws:")
  })

  it("connect-src includes localhost:4000 for local dev", () => {
    const m = nextConfigRaw.match(/connect-src[\s\S]{0,400}?(?=";|`,)/)
    expect(m?.[0] ?? "").toContain("localhost:4000")
  })

  it("connect-src or its template references the Render backend", () => {
    // The connect-src line either contains the literal URL or the RENDER_BACKEND constant
    const m = nextConfigRaw.match(/connect-src[\s\S]{0,400}?(?=";|`,)/)
    const line = m?.[0] ?? ""
    const hasLiteral  = line.includes("kaiveron-backend.onrender.com")
    const hasConstant = line.includes("RENDER_BACKEND")
    expect(hasLiteral || hasConstant).toBe(true)
  })

  it("does NOT list old Railway URL in the connect-src value (only in comments is ok)", () => {
    // Extract connect-src line — comments stripped so only code remains
    const m = nextConfig.match(/connect-src[\s\S]{0,400}?(?=";|`,)/)
    const line = m?.[0] ?? ""
    expect(line).not.toContain("railway.app")
  })

  it("includes api.jikan.moe for anime catalog", () => {
    const m = nextConfigRaw.match(/connect-src[\s\S]{0,400}?(?=";|`,)/)
    expect(m?.[0] ?? "").toContain("api.jikan.moe")
  })
})

// ── Permissions-Policy ────────────────────────────────────────────────────────

describe("Permissions-Policy — camera + microphone must not be fully denied", () => {

  // Extract the Permissions-Policy value
  const ppValue = (() => {
    const m = nextConfigRaw.match(/Permissions-Policy[^}]{0,200}?value[^"]*"([^"]{5,})"/)
    return m?.[1] ?? ""
  })()

  it("extracted a non-empty Permissions-Policy value from next.config.ts", () => {
    expect(ppValue.length).toBeGreaterThan(0)
  })

  it("does NOT use camera=() — empty allow-list blocks getUserMedia() for everyone", () => {
    // camera=() means DENY ALL — WebRTC video calls can never work
    expect(ppValue).not.toMatch(/camera=\(\s*\)/)
  })

  it("does NOT use microphone=() — empty allow-list blocks audio for everyone", () => {
    // microphone=() means DENY ALL — WebRTC audio calls can never work
    expect(ppValue).not.toMatch(/microphone=\(\s*\)/)
  })

  it("allows camera for the same origin (self)", () => {
    const ok = ppValue.includes("camera=(self)") || ppValue.includes("camera=*")
    expect(ok).toBe(true)
  })

  it("allows microphone for the same origin (self)", () => {
    const ok = ppValue.includes("microphone=(self)") || ppValue.includes("microphone=*")
    expect(ok).toBe(true)
  })

  it("still blocks geolocation (not needed by Kaiveron)", () => {
    expect(ppValue).toContain("geolocation=()")
  })
})

// ── style-src ─────────────────────────────────────────────────────────────────

describe("CSP style-src — third-party stylesheets", () => {
  const styleSrc = nextConfigRaw.match(/style-src[^\n\r]{0,300}/)?.[0] ?? ""

  it("includes Google Accounts for Sign In button styling", () => {
    // Without this, Google One-Tap CSS is blocked → styling broken
    expect(styleSrc).toContain("accounts.google.com")
  })

  it("includes Google Fonts CDN", () => {
    expect(styleSrc).toContain("fonts.googleapis.com")
  })
})

// ── script-src ────────────────────────────────────────────────────────────────

describe("CSP script-src — third-party scripts", () => {
  const scriptSrc = nextConfigRaw.match(/script-src[^\n\r]{0,300}/)?.[0] ?? ""

  it("includes Google APIs for OAuth", () => {
    expect(scriptSrc).toContain("apis.google.com")
  })

  it("includes Apple CDN for Sign In with Apple", () => {
    expect(scriptSrc).toContain("appleid.cdn-apple.com")
  })
})

// ── Socket.io URL tests ───────────────────────────────────────────────────────

describe("socket.ts — production URL must never fall back to localhost", () => {

  it("defines the Render backend URL as a constant", () => {
    expect(socketRaw).toContain("kaiveron-backend.onrender.com")
  })

  it("does not use localhost as production fallback in getSocketUrl()", () => {
    // Bug was: `return envUrl ?? "http://localhost:4000"` — when envUrl was empty
    // string (falsy), this returned localhost even in production
    const badPattern = socketCode.match(/envUrl\s*\?\?\s*["'`]http:\/\/localhost/)
    expect(badPattern).toBeNull()
  })

  it("uses polling transport before websocket (Render load balancer requirement)", () => {
    // Render's proxy requires HTTP polling handshake before WebSocket upgrade.
    // ["websocket"] only → silent failure behind Render's load balancer.
    const m = socketRaw.match(/"polling"[\s\S]{0,50}"websocket"/)
    expect(m).not.toBeNull()
  })

  it("has reconnection: true", () => {
    expect(socketRaw).toContain("reconnection: true")
  })

  it("reconnectionAttempts is Infinity or ≥ 10 (Render cold start = up to 30s)", () => {
    // 5 attempts × 3s = 15s — not enough for Render's 30s cold start
    if (socketRaw.includes("reconnectionAttempts: Infinity")) {
      expect(true).toBe(true)
      return
    }
    const m = socketRaw.match(/reconnectionAttempts:\s*(\d+)/)
    if (m) {
      expect(parseInt(m[1], 10)).toBeGreaterThanOrEqual(10)
    } else {
      // Not set → Socket.io default is Infinity (acceptable)
      expect(true).toBe(true)
    }
  })

  it("detects 'unauthorized' connect_error to avoid infinite retry on rotated JWT", () => {
    // When JWT secrets rotate, every reconnect attempt fails with 'unauthorized'.
    // The error handler must catch this and trigger a page reload / session refresh.
    expect(socketCode).toContain("unauthorized")
  })
})

// ── API rewrites ──────────────────────────────────────────────────────────────

describe("next.config.ts rewrites — API proxy via env var", () => {

  it("proxies /api/v1/* using API_BASE env var", () => {
    expect(nextConfigRaw).toContain("API_BASE")
    expect(nextConfigRaw).toContain("/api/v1/:path*")
  })

  it("falls back to localhost:4000 when API_BASE is unset (dev mode)", () => {
    // In dev, API_BASE is not set so we fall back to local backend
    expect(nextConfigRaw).toMatch(/API_BASE[^;]{0,50}localhost:4000|localhost:4000[^;]{0,50}API_BASE/)
  })

  it("rewrites do not hardcode a Railway URL", () => {
    // Find the rewrites() function — strip comments first to avoid comment mentions
    const rewritesFn = nextConfig.match(/async rewrites[\s\S]{0,600}?return \[[\s\S]*?\]/)
    const block = rewritesFn?.[0] ?? nextConfig
    expect(block).not.toContain("railway.app")
  })
})
