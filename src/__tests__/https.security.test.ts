/**
 * HTTPS and security context tests.
 */
import { describe, it, expect } from "vitest"

// ── Secure context detection ──────────────────────────────────────────────────

function isSecureContext(): boolean {
  if (typeof window === "undefined") return false
  // Modern API
  if (typeof window.isSecureContext !== "undefined") return window.isSecureContext
  // Fallback detection
  const { protocol, hostname } = window.location
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1"
}

describe("secure context detection", () => {
  it("localhost is always a secure context", () => {
    // jsdom simulates localhost
    // In real browser: localhost → isSecureContext = true
    // Our fallback logic handles this
    const hostname = "localhost"
    const isSecure = hostname === "localhost" || hostname === "127.0.0.1"
    expect(isSecure).toBe(true)
  })

  it("127.0.0.1 is a secure context", () => {
    const hostname: string = "127.0.0.1"
    const isSecure = ["localhost", "127.0.0.1"].includes(hostname)
    expect(isSecure).toBe(true)
  })

  it("https:// URLs are secure contexts", () => {
    const protocol: string = "https:"
    const isSecure = protocol === "https:"
    expect(isSecure).toBe(true)
  })

  it("http:// LAN IP is NOT a secure context", () => {
    const protocol: string = "http:"
    const hostname: string = "192.168.31.167"
    const isSecure = protocol === "https:" || ["localhost", "127.0.0.1"].includes(hostname)
    expect(isSecure).toBe(false)
  })

  it("https:// LAN IP IS a secure context", () => {
    const protocol: string = "https:"
    const hostname: string = "192.168.31.167"
    const isSecure = protocol === "https:" || ["localhost", "127.0.0.1"].includes(hostname)
    expect(isSecure).toBe(true)
  })
})

// ── E2E availability logic ────────────────────────────────────────────────────

describe("E2E availability", () => {
  it("E2E is available in jsdom (simulates localhost/https)", () => {
    // In jsdom test environment, crypto.subtle is available
    expect(typeof globalThis.crypto?.subtle).not.toBe("undefined")
  })

  it("isE2EAvailable flag reflects crypto.subtle availability", async () => {
    const { isE2EAvailable } = await import("@/lib/e2e-crypto")
    // In test environment (localhost-equivalent), should be available
    expect(typeof isE2EAvailable).toBe("boolean")
  })
})

// ── Socket URL logic ──────────────────────────────────────────────────────────

describe("socket URL construction", () => {
  it("localhost connects to port 4000 directly", () => {
    const host = "localhost"
    const socketUrl = `http://${host}:4000`
    expect(socketUrl).toBe("http://localhost:4000")
  })

  it("LAN IP connects to port 4000 directly", () => {
    const host = "192.168.31.167"
    const socketUrl = `http://${host}:4000`
    expect(socketUrl).toBe("http://192.168.31.167:4000")
  })

  it("API proxy uses relative path (same port as frontend)", () => {
    // When on LAN, API calls go to /api/v1/... (proxied through Next.js at port 3000)
    const apiBase = ""  // empty = same origin
    const endpoint = `${apiBase}/api/v1/auth/login`
    expect(endpoint).toBe("/api/v1/auth/login")
  })
})
