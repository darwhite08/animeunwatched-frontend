/**
 * "Resume where you left off" — remembers the last meaningful page the user was
 * on (localStorage, so it survives logout) and offers it back as the post-login
 * destination. Auth/transient routes are never saved, so we never resume onto a
 * login screen or a half-finished flow.
 */
const KEY = "kv_last_path"

const EXCLUDE = [
  /^\/login/, /^\/register/, /^\/verify-email/, /^\/forgot-password/,
  /^\/reset-password/, /^\/auth(\/|$)/, /^\/logout/, /^\/clear-session/,
]

function isResumable(path: string | null | undefined): path is string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false
  if (path === "/") return false // landing page is the default anyway
  return !EXCLUDE.some((re) => re.test(path))
}

export function setLastPath(path: string): void {
  try { if (isResumable(path)) localStorage.setItem(KEY, path) } catch { /* ignore */ }
}

export function getLastPath(): string | null {
  try {
    const p = localStorage.getItem(KEY)
    return isResumable(p) ? p : null
  } catch { return null }
}

export function clearLastPath(): void {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
