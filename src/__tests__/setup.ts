import "@testing-library/jest-dom"

// Web Crypto API is available natively in Node 18+ via globalThis.crypto
// jsdom exposes it too, but we ensure it's set
if (!globalThis.crypto) {
  const { webcrypto } = await import("crypto")
  Object.defineProperty(globalThis, "crypto", { value: webcrypto })
}
