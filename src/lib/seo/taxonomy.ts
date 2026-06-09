/**
 * SEO taxonomy — canonical genre/studio slug ↔ name maps and landing-page copy.
 *
 * These power the programmatic landing pages (/genres/[slug], /studios/[slug])
 * and the sitemap. Slugs are URL-stable (never change them once indexed —
 * a changed slug = a lost ranking + a 404). Names match the catalog genre
 * names the backend filters on (?genre=Action), case-insensitive.
 */

export interface GenreEntry {
  /** URL slug — stable, lowercase, hyphenated. Never rename post-launch. */
  slug: string
  /** Catalog name passed to the API ?genre= filter (case-insensitive match). */
  name: string
  /** Short editorial line used in <h1> sub-copy + meta description. */
  blurb: string
  /** Emoji for visual flair on the landing page. */
  emoji: string
}

/**
 * The canonical MyAnimeList genre/theme set Kaiveron indexes. Ordered by
 * rough search volume so the index page and sitemap surface the highest-value
 * pages first.
 */
export const GENRES: GenreEntry[] = [
  { slug: "action",         name: "Action",        emoji: "⚔️", blurb: "high-octane fights, tournaments, and shonen battles" },
  { slug: "romance",        name: "Romance",       emoji: "💕", blurb: "slow-burn love stories and heart-fluttering rom-coms" },
  { slug: "isekai",         name: "Isekai",        emoji: "🌀", blurb: "another-world adventures, reincarnation, and game-world fantasy" },
  { slug: "fantasy",        name: "Fantasy",       emoji: "🐉", blurb: "magic systems, dragons, and sprawling fantasy worlds" },
  { slug: "comedy",         name: "Comedy",        emoji: "😂", blurb: "gag series, parodies, and laugh-out-loud comedies" },
  { slug: "adventure",      name: "Adventure",     emoji: "🗺️", blurb: "epic journeys, exploration, and grand quests" },
  { slug: "drama",          name: "Drama",         emoji: "🎬", blurb: "emotional, character-driven stories that hit hard" },
  { slug: "sci-fi",         name: "Sci-Fi",        emoji: "🚀", blurb: "space opera, cyberpunk, and hard science fiction" },
  { slug: "slice-of-life",  name: "Slice of Life", emoji: "🌿", blurb: "cozy, low-stakes, everyday-life comfort anime" },
  { slug: "supernatural",   name: "Supernatural",  emoji: "👁️", blurb: "spirits, powers, and the unexplained" },
  { slug: "mystery",        name: "Mystery",       emoji: "🔍", blurb: "whodunits, detectives, and twisty puzzle-box plots" },
  { slug: "psychological",  name: "Psychological", emoji: "🧠", blurb: "mind games, dark themes, and unreliable narrators" },
  { slug: "horror",         name: "Horror",        emoji: "👹", blurb: "dread, gore, and supernatural terror" },
  { slug: "thriller",       name: "Suspense",      emoji: "🔪", blurb: "tension-soaked thrillers and edge-of-your-seat suspense" },
  { slug: "sports",         name: "Sports",        emoji: "🏆", blurb: "underdog teams, rivalries, and athletic glory" },
  { slug: "mecha",          name: "Mecha",         emoji: "🤖", blurb: "giant robots, pilots, and mechanized warfare" },
  { slug: "shounen",        name: "Shounen",       emoji: "🔥", blurb: "the friendship-effort-victory classics teens love" },
  { slug: "seinen",         name: "Seinen",        emoji: "📖", blurb: "mature, complex stories aimed at adult readers" },
  { slug: "shoujo",         name: "Shoujo",        emoji: "🌷", blurb: "romance and drama aimed at a young-women audience" },
  { slug: "music",          name: "Music",         emoji: "🎵", blurb: "idols, bands, and music-driven stories" },
  { slug: "military",       name: "Military",      emoji: "🎖️", blurb: "war, strategy, and armed-forces drama" },
  { slug: "historical",     name: "Historical",    emoji: "🏯", blurb: "samurai eras, period pieces, and real-history settings" },
  { slug: "school",         name: "School",        emoji: "🏫", blurb: "classroom life, clubs, and high-school drama" },
  { slug: "vampire",        name: "Vampire",       emoji: "🧛", blurb: "bloodsuckers, hunters, and gothic horror" },
  { slug: "space",          name: "Space",         emoji: "🌌", blurb: "interstellar journeys and cosmic-scale stories" },
]

const GENRE_BY_SLUG = new Map(GENRES.map((g) => [g.slug, g]))

export function getGenre(slug: string): GenreEntry | undefined {
  return GENRE_BY_SLUG.get(slug.toLowerCase())
}

/** Turn an arbitrary studio/genre display name into a URL-safe slug. */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Well-known studios with stable slugs. The studio landing pages also accept
 * any slug the API knows about (resolved live), but these get static
 * generation + sitemap inclusion because they pull the most search traffic.
 */
export const FEATURED_STUDIOS: string[] = [
  "MAPPA", "ufotable", "Madhouse", "Kyoto Animation", "Wit Studio",
  "Bones", "A-1 Pictures", "Studio Ghibli", "Production I.G", "Trigger",
  "Sunrise", "Toei Animation", "Shaft", "CloverWorks", "J.C.Staff",
  "Pierrot", "Doga Kobo", "P.A. Works", "Gainax", "David Production",
]
