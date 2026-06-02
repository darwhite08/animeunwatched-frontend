/**
 * End-to-end encryption for Kaiveron DMs.
 *
 * Protocol:
 *  1. Each client generates an ECDH P-256 key pair.
 *  2. Public key is uploaded to the server (JWK format).
 *  3. Before messaging user B, client A fetches B's public key.
 *  4. Both clients derive the same AES-GCM-256 shared key via ECDH.
 *  5. Every message is encrypted with AES-GCM + a random IV.
 *  6. Server stores only the ciphertext + IV — it cannot read messages.
 *
 * Key storage: JWK-exported keys are kept in localStorage so they persist
 * across sessions, tabs, and browser restarts — this ensures old messages
 * remain decryptable after reopening the app.  The private key is NEVER
 * sent to the server.
 */

// ── E2E mode ──────────────────────────────────────────────────────────────────
// E2E is currently disabled platform-wide — too many "Could not decrypt"
// edge cases (private key lost on new browser, cleared storage, key
// rotation when someone re-logs). With E2E off, every message rides the
// existing { ciphertext, iv } shape but the ciphertext is just base64 of
// the plaintext. TLS still protects messages in transit; the backend can
// read them at rest. Flip this back to `true` only after we wire a real
// key-recovery flow.
const E2E_ENABLED = false

// Secure-context guard kept for the legacy path. When E2E is disabled
// we ignore this entirely.
export const isE2EAvailable: boolean =
  E2E_ENABLED && typeof window !== "undefined" && !!window.crypto?.subtle

// Use localStorage so keys persist across browser sessions, tabs, and refreshes.
// Without this, closing a tab generates a new key pair, making all old messages
// show "Could not decrypt" because the shared secret changes.
const SESSION_PUB  = "aw_e2e_pub"
const SESSION_PRIV = "aw_e2e_priv"

function store(): Storage {
  try { return localStorage } catch { return sessionStorage }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const str = atob(b64)
  const buf = new ArrayBuffer(str.length)
  const arr = new Uint8Array(buf)
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i)
  return arr
}

function bytesToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

// ── Key-pair management ───────────────────────────────────────────────────────

/** Generate (or reuse from localStorage) the local ECDH key pair. */
export async function getOrCreateKeyPair(): Promise<{
  publicKeyJwk: string
  privateKey: CryptoKey
}> {
  const storedPub  = store().getItem(SESSION_PUB)
  const storedPriv = store().getItem(SESSION_PRIV)

  if (storedPub && storedPriv) {
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      JSON.parse(storedPriv) as JsonWebKey,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      ["deriveKey"],
    )
    return { publicKeyJwk: storedPub, privateKey }
  }

  const pair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"],
  )

  const pubJwk  = await window.crypto.subtle.exportKey("jwk", pair.publicKey)
  const privJwk = await window.crypto.subtle.exportKey("jwk", pair.privateKey)

  const pubStr  = JSON.stringify(pubJwk)
  const privStr = JSON.stringify(privJwk)

  store().setItem(SESSION_PUB,  pubStr)
  store().setItem(SESSION_PRIV, privStr)

  return { publicKeyJwk: pubStr, privateKey: pair.privateKey }
}

/** Import a recipient's public key string (JWK) for ECDH. */
async function importRemotePublicKey(jwkStr: string): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(jwkStr) as JsonWebKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  )
}

/** Derive an AES-GCM-256 shared secret from local private key + remote public key. */
async function deriveSharedKey(
  privateKey: CryptoKey,
  remotePublicKey: CryptoKey,
): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    { name: "ECDH", public: remotePublicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

// ── Shared-key cache (avoids re-deriving on every message) ───────────────────

const sharedKeyCache = new Map<string, CryptoKey>()

/** Get or compute the shared AES-GCM key for a conversation partner. */
export async function getSharedKey(
  myPrivateKey: CryptoKey,
  theirPublicKeyJwk: string,
): Promise<CryptoKey> {
  const cached = sharedKeyCache.get(theirPublicKeyJwk)
  if (cached) return cached

  const remoteKey = await importRemotePublicKey(theirPublicKeyJwk)
  const shared    = await deriveSharedKey(myPrivateKey, remoteKey)
  sharedKeyCache.set(theirPublicKeyJwk, shared)
  return shared
}

// ── Encrypt / Decrypt ─────────────────────────────────────────────────────────

// Marker stored in IV field to indicate a non-E2E (server-readable) message.
// Used when crypto.subtle is unavailable (HTTP on LAN IP).
const PLAIN_IV_MARKER = "PLAIN_NO_E2E"

export async function encryptMessage(
  sharedKey: CryptoKey | null,
  plaintext: string,
): Promise<{ ciphertext: string; iv: string }> {
  // Fallback: no E2E available (non-secure context like http://192.168.x.x)
  // Encode as base64 so the API still receives ciphertext+iv fields.
  if (!sharedKey || !isE2EAvailable) {
    return {
      ciphertext: btoa(unescape(encodeURIComponent(plaintext))),
      iv:         PLAIN_IV_MARKER,
    }
  }

  const iv      = window.crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    encoded,
  )

  return {
    ciphertext: bytesToB64(encrypted),
    iv:         bytesToB64(iv.buffer),
  }
}

export async function decryptMessage(
  sharedKey: CryptoKey | null,
  ciphertext: string,
  iv: string,
): Promise<string> {
  // If this message was sent without E2E (plain marker), just base64-decode it.
  // Also attempt this path when we have NO sharedKey OR no E2E available, so
  // messages from the previous E2E era still surface text where possible.
  if (iv === PLAIN_IV_MARKER || !sharedKey || !isE2EAvailable) {
    try {
      return decodeURIComponent(escape(atob(ciphertext)))
    } catch {
      return ciphertext
    }
  }

  if (!sharedKey || !isE2EAvailable) {
    throw new Error("E2E key unavailable")
  }

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(iv) },
    sharedKey,
    b64ToBytes(ciphertext),
  )
  return new TextDecoder().decode(decrypted)
}

/** Decrypt a batch of messages, silently skipping any that fail. */
export async function decryptMessages(
  sharedKey: CryptoKey,
  messages: Array<{ ciphertext: string; iv: string; [k: string]: unknown }>,
): Promise<Array<{ decryptedText: string; [k: string]: unknown }>> {
  return Promise.all(
    messages.map(async msg => {
      try {
        const decryptedText = await decryptMessage(sharedKey, msg.ciphertext, msg.iv)
        return { ...msg, decryptedText }
      } catch {
        return { ...msg, decryptedText: "⚠ Could not decrypt message" }
      }
    }),
  )
}
