/* DTOs mirroring the backend API contract. Never import from the backend repo. */

export type Role = "USER" | "MOD" | "ADMIN"
export type WatchStatus = "PLAN_TO_WATCH" | "WATCHING" | "COMPLETED" | "ON_HOLD" | "DROPPED"
export type BlogStatus = "DRAFT" | "PUBLISHED"

export interface User {
  id: string
  email: string
  username: string
  displayName: string
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
  source: string | null
  genres: { name: string }[]
  studios: { name: string }[]
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

export interface Post {
  id: string
  authorId: string
  content: string
  animeId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">
  anime?: Pick<AnimeDTO, "id" | "malId" | "title" | "imageUrl"> | null
  _count?: { likes: number; comments: number }
  liked?: boolean
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">
}

export interface UserProfile extends User {
  stats: { followers: number; following: number; listCount: number; reviewCount: number }
  recentPosts: Post[]
}

export interface Notification {
  id: string
  recipientId: string
  type: string
  payload: Record<string, unknown>
  read: boolean
  createdAt: string
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
