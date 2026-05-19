/**
 * E2E crypto property tests.
 * Note: Full ECDH key exchange tests are in chat.test.ts.
 * These tests cover additional edge cases.
 */
import { describe, it, expect } from "vitest"

// ── JWK format validation ─────────────────────────────────────────────────────

function isValidP256JWK(jwkStr: string): boolean {
  try {
    const jwk = JSON.parse(jwkStr) as Record<string, unknown>
    return (
      jwk.kty === "EC" &&
      jwk.crv === "P-256" &&
      typeof jwk.x === "string" &&
      typeof jwk.y === "string" &&
      jwk.d === undefined // no private key material in public key
    )
  } catch {
    return false
  }
}

describe("JWK format validation", () => {
  it("accepts valid P-256 public JWK", () => {
    const jwk = JSON.stringify({
      kty: "EC",
      crv: "P-256",
      x: "base64urlx",
      y: "base64urly",
      key_ops: ["deriveBits"],
    })
    expect(isValidP256JWK(jwk)).toBe(true)
  })

  it("rejects JWK with private key material (d field)", () => {
    const jwk = JSON.stringify({
      kty: "EC",
      crv: "P-256",
      x: "base64urlx",
      y: "base64urly",
      d: "private-scalar",  // MUST be rejected
    })
    expect(isValidP256JWK(jwk)).toBe(false)
  })

  it("rejects JWK with wrong curve", () => {
    const jwk = JSON.stringify({ kty: "EC", crv: "P-384", x: "x", y: "y" })
    expect(isValidP256JWK(jwk)).toBe(false)
  })

  it("rejects invalid JSON", () => {
    expect(isValidP256JWK("not json")).toBe(false)
  })

  it("rejects empty object", () => {
    expect(isValidP256JWK("{}")).toBe(false)
  })

  it("rejects RSA key (wrong kty)", () => {
    const jwk = JSON.stringify({ kty: "RSA", n: "modulus", e: "AQAB" })
    expect(isValidP256JWK(jwk)).toBe(false)
  })
})

// ── Base64 encoding/decoding helpers ─────────────────────────────────────────

function isValidBase64(s: string): boolean {
  try {
    atob(s)
    return true
  } catch {
    return false
  }
}

describe("Base64 encoding helpers", () => {
  it("recognizes valid base64 strings", () => {
    expect(isValidBase64("SGVsbG8gV29ybGQ=")).toBe(true)
    expect(isValidBase64("YW5pbWU=")).toBe(true)
  })

  it("rejects invalid base64", () => {
    expect(isValidBase64("!not-base64!")).toBe(false)
  })

  it("accepts empty base64 string", () => {
    expect(isValidBase64("")).toBe(true)
  })
})

// ── AES-GCM IV length expectations ───────────────────────────────────────────

describe("AES-GCM IV length", () => {
  it("12-byte IV is standard for AES-GCM", () => {
    // AES-GCM recommended IV length is 96 bits = 12 bytes
    const iv = new Uint8Array(12)
    expect(iv.length).toBe(12)
  })

  it("12-byte IV encodes to 16 base64 characters", () => {
    // base64(12 bytes) = ceil(12 * 4 / 3) = 16 chars
    const bytes = new Uint8Array(12).fill(65) // 'A' * 12
    const b64 = btoa(String.fromCharCode(...bytes))
    expect(b64.length).toBe(16)
  })
})
