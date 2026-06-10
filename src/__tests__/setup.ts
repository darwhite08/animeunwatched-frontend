import "@testing-library/jest-dom"

// Web Crypto API is available natively in Node 18+ via globalThis.crypto
// jsdom exposes it too, but we ensure it's set
if (!globalThis.crypto) {
  const { webcrypto } = await import("crypto")
  Object.defineProperty(globalThis, "crypto", { value: webcrypto })
}

// Storage polyfill. On Node 22+ the global `localStorage`/`sessionStorage` are
// Node's experimental built-ins, which are *undefined* unless the process is
// started with `--localstorage-file`. That shadows jsdom's implementation, so
// `localStorage.clear()` throws "Cannot read properties of undefined". Install a
// deterministic in-memory Storage on both globalThis and window so tests that
// touch web storage (e.g. e2e-crypto key cache) run reliably in CI.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length(): number { return this.store.size }
  clear(): void { this.store.clear() }
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null }
  setItem(key: string, value: string): void { this.store.set(String(key), String(value)) }
  removeItem(key: string): void { this.store.delete(key) }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null }
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  const mock = new MemoryStorage()
  try {
    Object.defineProperty(globalThis, name, { value: mock, configurable: true, writable: true })
  } catch { /* non-configurable global — ignore */ }
  if (typeof window !== "undefined") {
    try {
      Object.defineProperty(window, name, { value: mock, configurable: true, writable: true })
    } catch { /* ignore */ }
  }
}
