import { api } from "./client"
import type {
  AuthResponse, RefreshResponse, User, UserProfile,
  AnimeDTO, ListEntry, WatchStatus,
  Post, PostComment, Paginated, CursorPaginated,
  Notification,
  ConversationSummary, ConversationDetail, DirectMessage,
} from "./types"

/* ── Auth ── */
export const register = (body: {
  email: string; username: string; displayName: string; password: string
}) => api<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) })

export const login = (body: { email: string; password: string }) =>
  api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) })

export const refresh = () => api<RefreshResponse>("/auth/refresh", { method: "POST" })

export const logout = () => api<void>("/auth/logout", { method: "POST" })

export const me = () => api<{ user: User }>("/auth/me")

/* ── Users ── */
export const getUser = (username: string) =>
  api<{ user: UserProfile }>(`/users/${username}`)

export const updateMe = (body: { displayName?: string; bio?: string; avatarUrl?: string }) =>
  api<{ user: User }>("/users/me", { method: "PATCH", body: JSON.stringify(body) })

export const follow = (username: string) =>
  api<void>(`/users/${username}/follow`, { method: "POST" })

export const unfollow = (username: string) =>
  api<void>(`/users/${username}/follow`, { method: "DELETE" })

export const getFollowers = (username: string, page = 1) =>
  api<Paginated<User>>(`/users/${username}/followers?page=${page}`)

export const getFollowing = (username: string, page = 1) =>
  api<Paginated<User>>(`/users/${username}/following?page=${page}`)

/* ── Anime ── */
export const browseAnime = (params: {
  q?: string; year?: number; season?: string; type?: string; status?: string;
  studio?: string; start_date?: string; end_date?: string; page?: number; limit?: number
}) => {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()
  return api<Paginated<AnimeDTO>>(`/anime${qs ? `?${qs}` : ""}`)
}

export const getAnime = (malId: number) =>
  api<{ anime: AnimeDTO; listEntry: ListEntry | null }>(`/anime/${malId}`)

export const searchAnimeApi = (q: string) =>
  api<{ data: AnimeDTO[] }>(`/anime/search?q=${encodeURIComponent(q)}`)

export const getSeasonal = (year: number, season: string) =>
  api<Paginated<AnimeDTO>>(`/anime/season/${year}/${season}`)

/* ── Lists ── */
export const getList = (username: string, status?: WatchStatus) =>
  api<Paginated<ListEntry>>(`/lists/${username}${status ? `?status=${status}` : ""}`)

export const upsertListEntry = (
  animeId: string,
  body: {
    status: WatchStatus
    score?: number
    episodesSeen?: number
    startedAt?: string
    finishedAt?: string
    notes?: string
  },
) => api<{ entry: ListEntry }>(`/lists/me/${animeId}`, { method: "PUT", body: JSON.stringify(body) })

export const removeListEntry = (animeId: string) =>
  api<void>(`/lists/me/${animeId}`, { method: "DELETE" })

/* ── Posts ── */
export const getFeed = (cursor?: string) =>
  api<CursorPaginated<Post>>(`/posts/feed${cursor ? `?cursor=${cursor}` : ""}`)

export const getDiscover = (cursor?: string) =>
  api<CursorPaginated<Post>>(`/posts/discover${cursor ? `?cursor=${cursor}` : ""}`)

export const getPost = (id: string) =>
  api<{ post: Post; liked: boolean }>(`/posts/${id}`)

export const createPost = (body: { content: string; animeId?: string }) =>
  api<{ post: Post }>("/posts", { method: "POST", body: JSON.stringify(body) })

export const deletePost = (id: string) =>
  api<void>(`/posts/${id}`, { method: "DELETE" })

export const likePost = (id: string) =>
  api<void>(`/posts/${id}/like`, { method: "POST" })

export const unlikePost = (id: string) =>
  api<void>(`/posts/${id}/like`, { method: "DELETE" })

export const getComments = (postId: string, page = 1) =>
  api<Paginated<PostComment>>(`/posts/${postId}/comments?page=${page}`)

export const createComment = (postId: string, content: string) =>
  api<{ comment: PostComment }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  })

/* ── Notifications ── */
export const listNotifications = (page = 1) =>
  api<Paginated<Notification>>(`/notifications?page=${page}`)

export const getUnreadCount = () =>
  api<{ count: number }>("/notifications/unread-count")

export const markRead = (id: string) =>
  api<void>(`/notifications/${id}/read`, { method: "PATCH" })

export const markAllRead = () =>
  api<void>("/notifications/read-all", { method: "PATCH" })

/* ── Leaderboard ── */
export const getLeaderboard = (limit = 50, period = "all-time") =>
  api<{ data: Array<{ rank: number; username: string; displayName: string; avatarUrl: string | null; reputation: number; xp: number; level: number; archived: number; reviews: number; posts: number }>; meta: { total: number; period: string } }>(`/users/leaderboard/top?limit=${limit}&period=${period}`)

/* ── Chat (E2E encrypted DMs) ── */
export const uploadPublicKey = (publicKey: string) =>
  api<void>("/chat/keys/me", { method: "PUT", body: JSON.stringify({ publicKey }) })

export const getRecipientPublicKey = (userId: string) =>
  api<{ publicKey: string }>(`/chat/keys/${userId}`)

export const listConversations = () =>
  api<{ conversations: ConversationSummary[] }>("/chat/conversations")

export const startConversation = (recipientId: string) =>
  api<{ conversation: ConversationDetail }>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ recipientId }),
  })

export const getConversation = (conversationId: string) =>
  api<{ conversation: ConversationDetail }>(`/chat/conversations/${conversationId}`)

export const getMessages = (conversationId: string, cursor?: string, limit = 30) => {
  const qs = new URLSearchParams({ limit: String(limit), ...(cursor ? { cursor } : {}) })
  return api<{ messages: DirectMessage[]; nextCursor: string | null }>(
    `/chat/conversations/${conversationId}/messages?${qs}`
  )
}

export const sendEncryptedMessage = (conversationId: string, ciphertext: string, iv: string) =>
  api<{ message: DirectMessage }>(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ ciphertext, iv }),
  })

export const markConversationRead = (conversationId: string) =>
  api<{ conversationId: string; readAt: string }>(`/chat/conversations/${conversationId}/read`, { method: "PATCH" })

/* ── Search ── */
export const search = (
  q: string,
  type: "anime" | "posts" | "threads" | "users" | "blogs" = "anime",
  page = 1,
) => api<Paginated<unknown>>(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`)
