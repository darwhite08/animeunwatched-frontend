/* DTOs mirroring the backend API contract. Never import from the backend repo. */

// ── Chat (E2E encrypted DMs) ─────────────────────────────────────────────────
export interface DirectMessage {
  id:             string
  conversationId: string
  senderId:       string
  ciphertext:     string        // AES-GCM encrypted, base64
  iv:             string        // AES-GCM IV, base64
  createdAt:      string
  readAt:         string | null
  deletedAt?:     string | null  // "Delete for everyone" tombstone
  decryptedText?: string        // populated client-side after decryption
  // Multi-device E2E (present only when the message was envelope-encrypted)
  senderDeviceKeyId?: string | null
  envelopes?:     { recipientDeviceKeyId?: string; wrappedKey: string; wrapIv: string }[]
}

export interface ConversationSummary {
  id:          string
  otherUser:   { id: string; username: string; displayName: string; avatarUrl: string | null }
  lastMessage: DirectMessage | null
  updatedAt:   string
}

export interface ConversationDetail {
  id:        string
  otherUser: { id: string; username: string; displayName: string; avatarUrl: string | null }
  publicKey: string | null   // recipient's ECDH P-256 public key (JWK)
  createdAt: string
}

export type Role = "USER" | "MOD" | "ADMIN"
export type WatchStatus = "PLAN_TO_WATCH" | "WATCHING" | "COMPLETED" | "ON_HOLD" | "DROPPED" | "REWATCHING"
export type BlogStatus = "DRAFT" | "PUBLISHED"

export interface User {
  id: string
  email: string
  /** When the email was confirmed. null = unverified email/password signup. */
  emailVerifiedAt?: string | null
  username: string
  /** URL-safe routing alias. Never use for data fetching — always use session id internally. */
  slug: string | null
  displayName: string
  streakDays?: number
  bestStreak?: number
  lastActiveAt?: string | null
  bio: string | null
  avatarUrl: string | null
  role: Role
  reputation: number
  createdAt: string
}

export interface AnimeDTO {
  id: string
  malId: number
  title: string
  titleEnglish: string | null
  titleJapanese: string | null
  synopsis: string | null
  type: string | null
  episodes: number | null
  status: string | null
  airedFrom: string | null
  airedTo: string | null
  season: string | null
  year: number | null
  rating: string | null
  score: number | null
  imageUrl: string | null
  trailerUrl: string | null
  trailerYoutubeId: string | null
  source: string | null
  genres: string[]
  studios: string[]
}

export interface ListEntry {
  id: string
  userId: string
  animeId: string
  status: WatchStatus
  score: number | null
  episodesSeen: number
  startedAt: string | null
  finishedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  anime?: AnimeDTO
}

export interface Thread {
  id: string
  title: string
  content: string
  animeId?: string | null
  clubId?: string | null
  createdAt: string
  updatedAt: string
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">
  _count?: { replies: number; likes: number }
}

export interface Post {
  id: string
  authorId: string
  content: string
  animeId: string | null
  imageUrl: string | null
  imageUrls?: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">
  anime?: Pick<AnimeDTO, "id" | "malId" | "title" | "imageUrl"> | null
  _count?: { likes: number; comments: number }
  isLikedByMe?: boolean
  likePreview?: Array<{ username: string; displayName: string; avatarUrl: string | null }>
  liked?: boolean
}

/* Activity feed (FEED_FEATURES §12 — MVP) */
export type ActivityKind = "TEXT" | "LIST_UPDATE" | "MESSAGE"
export type ListActivityVerb =
  | "WATCHED_EPISODE" | "COMPLETED" | "ADDED_TO_PLAN"
  | "DROPPED" | "RATED" | "STARTED" | "REWATCHING"

export interface Activity {
  id: string
  authorId: string
  kind: ActivityKind
  body: string | null
  linkedAnimeId: string | null
  verb: ListActivityVerb | null
  episodeNumber: number | null
  score: number | null
  wallOwnerId: string | null
  hasSpoiler: boolean
  repostOfId: string | null
  likeCount: number
  repostCount: number
  replyCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> & { slug: string | null }
  linkedAnime: Pick<AnimeDTO, "id" | "malId" | "title" | "imageUrl"> | null
  repostOf: Activity | null
  isLikedByMe: boolean
  isRepostedByMe: boolean
}

export interface Reply {
  id: string
  activityId: string
  authorId: string
  body: string
  hasSpoiler: boolean
  replyCount: number
  likeCount: number
  parentReplyId: string | null
  createdAt: string
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl"> & { slug: string | null }
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  content: string
  parentCommentId: string | null
  likeCount: number
  replyCount: number
  createdAt: string
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">
  isLikedByMe?: boolean
  /** First N nested replies, only present on top-level comments returned by GET /posts/:id/comments. */
  replies?: PostComment[]
}

/**
 * Response shape for `GET /api/v1/users/:username`. The backend returns
 * `user`, `stats`, and `recentPosts` at the SAME level — `stats` is NOT
 * nested inside `user`. Until 2026-06-03 the wrong shape (`UserProfile
 * extends User`) lived here, which silently broke follower/following
 * counts on every profile surface — they all read `profileData.user.stats`
 * and got `undefined`. Keep stats at the top level.
 */
/** Compact post shape embedded in the public profile payload. */
export interface ProfilePost {
  id: string
  authorId: string
  content: string
  animeId: string | null
  imageUrl?: string | null
  createdAt: string
  anime?: { title: string; malId: number } | null
  _count?: { likes: number; comments: number }
}

export interface UserProfile {
  user: User & {
    coverImage?: string | null
    verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null
    isFollowing?: boolean
    followRequested?: boolean
  }
  stats: { followers: number; following: number; listCount: number; reviewCount: number; rank?: number }
  recentPosts: ProfilePost[]
  recentReviews?: Array<{ id: string; animeId: string; score: number; body: string | null; createdAt: string }>
  badges?: Array<{ code: string; serial?: number | null; earnedAt: string }>
}

export interface Notification {
  id: string
  recipientId: string
  type: string
  payload: Record<string, unknown>
  read: boolean
  createdAt: string
}

/* ── Board leaderboards ── */
export type LeaderboardBoardId = "episodes" | "reviews" | "streak" | "followed" | "xp"

export interface BoardLeaderboardRow {
  rank: number
  value: number
  secondary: number
  isFollowing: boolean
  /** Rank movement vs yesterday's snapshot (positive = climbed). null = no snapshot data (windowed/friends views). */
  delta: number | null
  /** Entered the board since yesterday's snapshot. */
  isNew: boolean
  user: {
    id: string
    username: string
    slug: string | null
    displayName: string
    avatarUrl: string | null
    verifiedKind: "USER" | "CREATOR" | "STUDIO" | null
    reputation: number
    level: number
  }
}

export interface BoardLeaderboard {
  board: LeaderboardBoardId
  window: "week" | "month" | "all"
  audience: "global" | "friends"
  total: number
  data: BoardLeaderboardRow[]
  me: { rank: number; value: number; secondary: number; nextValue: number | null } | null
}

/* Pagination wrappers */
export interface Paginated<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export interface CursorPaginated<T> {
  data: T[]
  meta: { nextCursor: string | null }
}

/* Auth responses */
export interface AuthResponse {
  user: User
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}
