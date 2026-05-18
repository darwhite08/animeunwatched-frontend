/**
 * End-to-end encryption for AnimeUnwatched DMs.
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

export async function encryptMessage(
  sharedKey: CryptoKey,
  plaintext: string,
): Promise<{ ciphertext: string; iv: string }> {
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
  sharedKey: CryptoKey,
  ciphertext: string,
  iv: string,
): Promise<string> {
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
