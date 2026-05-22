/**
 * Browser notification sound pool.
 *
 * Why this exists: previous code did `new Audio(path); audio.play().catch(()=>{})`
 * on demand for every ringtone / message ping. Browsers reject `play()` on a
 * freshly-created Audio element if it isn't tightly tied to a user gesture,
 * which made ALL incoming-call and new-message sounds silent.
 *
 * This module:
 *  1. Lazily creates ONE long-lived HTMLAudioElement per sound on first use.
 *  2. Installs a one-time gesture listener (pointerdown / keydown / touchstart)
 *     that unlocks every pooled element by doing a muted play()/pause() cycle.
 *  3. Reuses those same unlocked elements on subsequent play() calls — so a
 *     socket-driven ringtone or chime fires reliably after the user has
 *     clicked anywhere in the app once.
 *
 * SSR-safe: every function is a no-op when `window` is undefined.
 */

export type SoundName = "incoming-call" | "outgoing-call" | "new-message"

const SOUND_PATHS: Record<SoundName, string> = {
  "incoming-call": "/sounds/incoming-call.mp3",
  "outgoing-call": "/sounds/outgoing-call.mp3",
  "new-message":   "/sounds/new-message.mp3",
}

const DEFAULT_VOLUME: Record<SoundName, number> = {
  "incoming-call": 0.9,
  "outgoing-call": 0.6,
  "new-message":   0.5,
}

interface SoundEntry {
  el: HTMLAudioElement
  unlocked: boolean
}

let pool: Record<SoundName, SoundEntry> | null = null
let unlockInstalled = false

function getPool(): Record<SoundName, SoundEntry> | null {
  if (typeof window === "undefined") return null
  if (pool) return pool
  const p = {} as Record<SoundName, SoundEntry>
  for (const name of Object.keys(SOUND_PATHS) as SoundName[]) {
    const el = new Audio(SOUND_PATHS[name])
    el.preload = "auto"
    el.volume = DEFAULT_VOLUME[name]
    p[name] = { el, unlocked: false }
  }
  pool = p
  return p
}

async function unlockEntry(entry: SoundEntry): Promise<void> {
  if (entry.unlocked) return
  const wasMuted = entry.el.muted
  entry.el.muted = true
  try {
    await entry.el.play()
    entry.el.pause()
    entry.el.currentTime = 0
    entry.unlocked = true
  } catch {
    // gesture wasn't "strong" enough; try again on the next one
  } finally {
    entry.el.muted = wasMuted
  }
}

async function unlockAll(): Promise<void> {
  const p = getPool()
  if (!p) return
  await Promise.all(Object.values(p).map(unlockEntry))
}

function installUnlockListener(): void {
  if (unlockInstalled || typeof window === "undefined") return
  unlockInstalled = true
  const onGesture = async (): Promise<void> => {
    await unlockAll()
    const p = getPool()
    if (p && Object.values(p).every(e => e.unlocked)) {
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown",     onGesture)
      window.removeEventListener("touchstart",  onGesture)
    }
  }
  window.addEventListener("pointerdown", onGesture, { passive: true })
  window.addEventListener("keydown",     onGesture, { passive: true })
  window.addEventListener("touchstart",  onGesture, { passive: true })
}

/** Preload the audio elements + install the gesture-unlock listener. Call once on app mount. */
export function preloadNotificationAudio(): void {
  getPool()
  installUnlockListener()
}

export interface PlayOpts {
  loop?: boolean
  volume?: number
}

export function playSound(name: SoundName, opts: PlayOpts = {}): void {
  const p = getPool()
  if (!p) return
  installUnlockListener()
  const entry = p[name]
  entry.el.loop   = opts.loop ?? false
  entry.el.volume = opts.volume ?? DEFAULT_VOLUME[name]
  try { entry.el.currentTime = 0 } catch { /* element may not be seekable yet */ }
  entry.el.play().catch(() => {
    // Still autoplay-blocked — next user gesture will unlock + the caller can retry.
  })
}

export function stopSound(name: SoundName): void {
  const p = getPool()
  if (!p) return
  const entry = p[name]
  entry.el.pause()
  try { entry.el.currentTime = 0 } catch { /* ignore */ }
}

export function stopAllSounds(): void {
  const p = getPool()
  if (!p) return
  for (const entry of Object.values(p)) {
    entry.el.pause()
    try { entry.el.currentTime = 0 } catch { /* ignore */ }
  }
}

/** Test helper — resets pool + unlock flag so each test starts clean. */
export function __resetForTests(): void {
  pool = null
  unlockInstalled = false
}
