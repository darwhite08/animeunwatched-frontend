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
