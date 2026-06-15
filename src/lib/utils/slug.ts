/** Transform any string into a URL-safe slug. Mirrors the backend generateSlug(). */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
}

/** Returns null if valid, error message if invalid. */
export function validateSlug(slug: string): string | null {
  if (!slug || slug.length < 3)  return "Slug must be at least 3 characters"
  if (slug.length > 50)          return "Slug must be at most 50 characters"
  if (!/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(slug))
    return "Lowercase letters, numbers, and hyphens only"
  return null
}

/** Username (@handle) rules — mirrors the backend changeUsernameSchema:
    3–30 chars, letters / numbers / underscores only. Returns null if valid. */
export function validateUsername(username: string): string | null {
  if (!username || username.length < 3) return "Username must be at least 3 characters"
  if (username.length > 30)             return "Username must be at most 30 characters"
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Letters, numbers and underscores only"
  return null
}
