// A stable, first-party random id used to deduplicate anonymous Shot views.
// Not a fingerprint — just a UUID we generate and keep in localStorage. Signed-in
// users dedupe by their account id server-side; this only matters for logged-out
// viewers. See backend docs/shots-view-counting.md.
const KEY = "kv_vk"

export function getViewerKey(): string {
  if (typeof window === "undefined") return "ssr"
  try {
    let v = localStorage.getItem(KEY)
    if (!v) {
      v = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
      localStorage.setItem(KEY, v)
    }
    return v
  } catch {
    // Private mode / storage blocked — fall back to an ephemeral key.
    return `eph-${Math.random().toString(36).slice(2)}`
  }
}
