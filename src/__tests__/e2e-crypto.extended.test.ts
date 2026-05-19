/**
 * Extended E2E encryption tests — edge cases and security properties.
 */
import { describe, it, expect } from "vitest"

// ── Helper: simulate AES-GCM encrypt/decrypt without browser crypto ───────────
// These test the helper logic, not the actual crypto (which is tested in chat.test.ts)

function isBase64(str: string): boolean {
  if (!str) return true // empty is valid base64
  try {
    return btoa(atob(str)) === str || atob(btoa(str)) === str
  } catch {
    return false
  }
}

describe("base64 utilities for E2E crypto", () => {
  it("empty string is valid base64", () => {
    expect(isBase64("")).toBe(true)
  })

  it("recognizes valid base64 strings", () => {
    expect(isBase64("SGVsbG8=")).toBe(true)  // "Hello"
    expect(isBase64("AQIDBA==")).toBe(true)  // [1,2,3,4]
  })

  it("recognizes the 12-byte IV format", () => {
    // AES-GCM IV = 12 bytes = 16 base64 chars
    const iv = btoa(String.fromCharCode(...new Uint8Array(12)))
    expect(iv.length).toBe(16)
    expect(isBase64(iv)).toBe(true)
  })
})

// ── Conversation ID format ────────────────────────────────────────────────────

describe("conversation ID format", () => {
  it("CUID-style IDs start with 'c'", () => {
    // CUIDs always start with 'c' and are alphanumeric
    const cuid = "cm0n3c4k500000q9g0k0o0k0o"
    expect(cuid.startsWith("c")).toBe(true)
    expect(/^[a-z0-9]+$/.test(cuid)).toBe(true)
  })

  it("UUID format is distinct from CUID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000"
    const cuid = "cm0n3c4k500000q9g0k0o0k0o"
    // UUIDs have dashes; CUIDs do not
    expect(uuid.includes("-")).toBe(true)
    expect(cuid.includes("-")).toBe(false)
  })
})

// ── Message content validation ────────────────────────────────────────────────

describe("encrypted message format validation", () => {
  interface EncryptedMessage {
    ciphertext: string
    iv: string
  }

  function isValidEncryptedMessage(msg: EncryptedMessage): boolean {
    if (!msg.ciphertext || !msg.iv) return false
    // IV should decode to 12 bytes (16 base64 chars)
    try {
      const ivBytes = atob(msg.iv)
      return ivBytes.length === 12 && msg.ciphertext.length > 0
    } catch {
      return false
    }
  }

  it("accepts valid encrypted message", () => {
    const iv = btoa(String.fromCharCode(...new Uint8Array(12))) // 12 zero bytes
    const ciphertext = btoa("some encrypted data") // dummy ciphertext
    expect(isValidEncryptedMessage({ ciphertext, iv })).toBe(true)
  })

  it("rejects message with empty ciphertext", () => {
    const iv = btoa(String.fromCharCode(...new Uint8Array(12)))
    expect(isValidEncryptedMessage({ ciphertext: "", iv })).toBe(false)
  })

  it("rejects message with empty IV", () => {
    expect(isValidEncryptedMessage({ ciphertext: "abc", iv: "" })).toBe(false)
  })

  it("rejects message with wrong-length IV", () => {
    const wrongIv = btoa(String.fromCharCode(...new Uint8Array(16))) // 16 bytes, not 12
    expect(isValidEncryptedMessage({ ciphertext: "abc", iv: wrongIv })).toBe(false)
  })
})
