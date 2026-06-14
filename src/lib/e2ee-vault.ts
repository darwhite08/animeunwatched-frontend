"use client"

/**
 * Opt-in E2EE vault client — matches the server protocol in modules/e2ee.
 *
 *  • UMK (User Master Key): one random 256-bit key per user.
 *  • UMK is WRAPPED (AES-GCM) by a key-release key (KRK) derived from a
 *    PASSWORD (PBKDF2) and/or a PASSKEY (WebAuthn PRF). Wraps live server-side;
 *    the server only ever sees ciphertext.
 *  • Each DEVICE has an ECDH P-256 key pair; its private key is wrapped by the
 *    UMK. So any device that can recover the UMK (via password/passkey) can
 *    unwrap its own device key and take part in the conversation.
 *
 * This module covers SETUP + UNLOCK + device registration. Per-message envelope
 * encryption is wired separately once E2EE is switched on.
 */

import {
  e2eeState, e2eeSetup, e2eeAddDevice, type E2eeWrap, type E2eeWrapInput, type E2eeDeviceInput,
  webauthnRegisterOptions, webauthnRegisterVerify, webauthnAuthOptions, webauthnAuthVerify,
} from "@/lib/api/endpoints"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"

const PBKDF2_ITERS = 310_000
const LS_UMK    = "aw_e2ee_umk"        // raw UMK, base64 (this device, unlocked)
const LS_DEVPRIV = "aw_e2ee_devpriv"   // device private key JWK string
const LS_DEVID  = "aw_e2ee_devid"      // server device id

function ls(): Storage { try { return localStorage } catch { return sessionStorage } }
function b64(buf: ArrayBufferLike): string { return btoa(String.fromCharCode(...new Uint8Array(buf))) }
function unb64(s: string): Uint8Array<ArrayBuffer> { const t = atob(s); const buf = new ArrayBuffer(t.length); const u = new Uint8Array(buf); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u }
function unb64url(s: string): Uint8Array<ArrayBuffer> { return unb64(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4)) }
function strBytes(s: string): Uint8Array<ArrayBuffer> { const u = new Uint8Array(new ArrayBuffer(s.length)); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u }
function randBytes(n: number): Uint8Array<ArrayBuffer> { return window.crypto.getRandomValues(new Uint8Array(new ArrayBuffer(n))) }

const subtle = () => window.crypto.subtle

// ── KRK derivation ───────────────────────────────────────────────────────────
async function pbkdf2Krk(password: string, saltB64: string, iterations = PBKDF2_ITERS): Promise<CryptoKey> {
  const base = await subtle().importKey("raw", strBytes(password), "PBKDF2", false, ["deriveKey"])
  return subtle().deriveKey({ name: "PBKDF2", salt: unb64(saltB64), iterations, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
}
async function rawKrk(raw: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  return subtle().importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
}

// ── AES-GCM wrap/unwrap ──────────────────────────────────────────────────────
async function aesWrap(key: CryptoKey, data: BufferSource): Promise<{ ct: string; iv: string }> {
  const iv = randBytes(12)
  const ct = await subtle().encrypt({ name: "AES-GCM", iv }, key, data)
  return { ct: b64(ct), iv: b64(iv.buffer) }
}
async function aesUnwrap(key: CryptoKey, ctB64: string, ivB64: string): Promise<ArrayBuffer> {
  return subtle().decrypt({ name: "AES-GCM", iv: unb64(ivB64) }, key, unb64(ctB64))
}

// ── Device key (ECDH P-256) ──────────────────────────────────────────────────
async function genDeviceKey(): Promise<{ publicJwk: string; privJwk: string }> {
  const pair = await subtle().generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"])
  return {
    publicJwk: JSON.stringify(await subtle().exportKey("jwk", pair.publicKey)),
    privJwk: JSON.stringify(await subtle().exportKey("jwk", pair.privateKey)),
  }
}

// ── Passkey (WebAuthn PRF) ───────────────────────────────────────────────────
export const isPasskeySupported = typeof window !== "undefined" && !!window.PublicKeyCredential

/** Register a new passkey for the PRF wrap. Returns its credentialId. */
async function registerPasskey(): Promise<string> {
  const options = await webauthnRegisterOptions()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resp = await startRegistration({ optionsJSON: options as any })
  const v = await webauthnRegisterVerify(resp)
  if (!v.verified) throw new Error("Passkey registration failed")
  return v.credentialId ?? resp.id
}

/** Run a passkey assertion + verify it, and return the 32-byte PRF secret. */
async function passkeyKrk(): Promise<{ krk: CryptoKey; credentialId: string }> {
  const options = await webauthnAuthOptions()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resp = await startAuthentication({ optionsJSON: options as any })
  await webauthnAuthVerify(resp)
  // PRF output comes back from the authenticator in the client extension results.
  const ext = (resp as { clientExtensionResults?: { prf?: { results?: { first?: string } } } }).clientExtensionResults
  const prf = ext?.prf?.results?.first
  if (!prf) throw new Error("This passkey/device doesn't support PRF — use your password instead.")
  return { krk: await rawKrk(unb64url(prf)), credentialId: resp.id }
}

// ── Local unlocked state ─────────────────────────────────────────────────────
function cacheUnlocked(umkRaw: Uint8Array, devPrivJwk: string, devId: string) {
  ls().setItem(LS_UMK, b64(umkRaw.buffer))
  ls().setItem(LS_DEVPRIV, devPrivJwk)
  ls().setItem(LS_DEVID, devId)
}
export function isUnlocked(): boolean { return !!ls().getItem(LS_UMK) && !!ls().getItem(LS_DEVPRIV) }
export function lockThisDevice() { ls().removeItem(LS_UMK); ls().removeItem(LS_DEVPRIV); ls().removeItem(LS_DEVID) }
export function getDeviceId(): string | null { return ls().getItem(LS_DEVID) }

/** The unlocked device private key (ECDH) for envelope decryption, or null. */
export async function getUnlockedDevicePrivateKey(): Promise<CryptoKey | null> {
  const priv = ls().getItem(LS_DEVPRIV)
  if (!priv) return null
  try { return await subtle().importKey("jwk", JSON.parse(priv) as JsonWebKey, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]) } catch { return null }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** First-time setup: create the UMK, wrap it with a password (+ optional passkey),
 *  register this device. Stores everything server-side; unlocks this device. */
export async function setupVault(password: string, opts?: { addPasskey?: boolean; deviceName?: string }): Promise<void> {
  const umk = randBytes(32)
  const umkKey = await rawKrk(umk)

  // Device key, with its private half wrapped by the UMK.
  const dev = await genDeviceKey()
  const wrappedPriv = await aesWrap(umkKey, strBytes(dev.privJwk))

  // Password wrap of the UMK.
  const salt = b64(randBytes(16).buffer)
  const pwKrk = await pbkdf2Krk(password, salt)
  const pwWrap = await aesWrap(pwKrk, umk)
  const wraps: E2eeWrapInput[] = [{
    method: "FALLBACK_PASSPHRASE", wrappedUMK: pwWrap.ct, wrapIv: pwWrap.iv,
    kdfSalt: salt, kdfParams: { iterations: PBKDF2_ITERS, hash: "SHA-256" }, label: "Password",
  }]

  // Optional passkey wrap of the UMK.
  if (opts?.addPasskey && isPasskeySupported) {
    const credentialId = await registerPasskey()
    const { krk } = await passkeyKrk()
    const pkWrap = await aesWrap(krk, umk)
    wraps.push({ method: "PASSKEY_PRF", credentialId, wrappedUMK: pkWrap.ct, wrapIv: pkWrap.iv, label: "Passkey" })
  }

  const device: E2eeDeviceInput = { publicKey: dev.publicJwk, wrappedPrivKey: wrappedPriv.ct, wrapIv: wrappedPriv.iv, name: opts?.deviceName ?? deviceName() }
  const res = await e2eeSetup({ wraps, device })
  cacheUnlocked(umk, dev.privJwk, res.device.id)
}

/** Add a passkey unlock method to an already-unlocked vault. */
export async function addPasskeyToVault(): Promise<void> {
  const umkB64 = ls().getItem(LS_UMK)
  if (!umkB64) throw new Error("Unlock encryption first")
  const credentialId = await registerPasskey()
  const { krk } = await passkeyKrk()
  const pkWrap = await aesWrap(krk, unb64(umkB64))
  const { e2eeAddWrap } = await import("@/lib/api/endpoints")
  await e2eeAddWrap({ method: "PASSKEY_PRF", credentialId, wrappedUMK: pkWrap.ct, wrapIv: pkWrap.iv, label: "Passkey" })
}

/** Recover the UMK on this device using a password or passkey, then register
 *  this device (if new) so it can take part in conversations. */
export async function unlockVault(via: { password: string } | { passkey: true }): Promise<void> {
  const state = await e2eeState()
  if (!state.hasE2EE) throw new Error("Encryption isn't set up on this account yet")

  let umk: Uint8Array<ArrayBuffer> | null = null
  if ("password" in via) {
    const wrap = state.wraps.find(w => w.method === "FALLBACK_PASSPHRASE")
    if (!wrap?.kdfSalt) throw new Error("No password unlock is set on this account")
    const krk = await pbkdf2Krk(via.password, wrap.kdfSalt, (wrap.kdfParams as { iterations?: number })?.iterations ?? PBKDF2_ITERS)
    umk = new Uint8Array(await unwrapUMK(wrap, krk)) // throws on wrong password
  } else {
    const wrap = state.wraps.find(w => w.method === "PASSKEY_PRF")
    if (!wrap) throw new Error("No passkey is set on this account")
    const { krk } = await passkeyKrk()
    umk = new Uint8Array(await unwrapUMK(wrap, krk))
  }

  const umkKey = await rawKrk(umk)

  // Reuse a known device, otherwise enrol this one.
  const known = ls().getItem(LS_DEVPRIV) && ls().getItem(LS_DEVID)
  if (known) {
    cacheUnlocked(umk, ls().getItem(LS_DEVPRIV)!, ls().getItem(LS_DEVID)!)
    return
  }
  const dev = await genDeviceKey()
  const wrappedPriv = await aesWrap(umkKey, strBytes(dev.privJwk))
  const device = await e2eeAddDevice({ publicKey: dev.publicJwk, wrappedPrivKey: wrappedPriv.ct, wrapIv: wrappedPriv.iv, name: deviceName() })
  cacheUnlocked(umk, dev.privJwk, device.id)
}

async function unwrapUMK(wrap: E2eeWrap, krk: CryptoKey): Promise<ArrayBuffer> {
  return aesUnwrap(krk, wrap.wrappedUMK, wrap.wrapIv)
}

function deviceName(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  if (/iphone|ipad|ipod/i.test(ua)) return "iPhone"
  if (/android/i.test(ua)) return "Android"
  if (/mac/i.test(ua)) return "Mac"
  if (/windows/i.test(ua)) return "Windows PC"
  return "This device"
}
