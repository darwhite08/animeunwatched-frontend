import { api } from "./client"
import type {
  AuthResponse, RefreshResponse, User, UserProfile,
  AnimeDTO, ListEntry, WatchStatus, AnimeCharacterEntry, AnimeStaffEntry,
  Post, PostComment, Paginated, CursorPaginated,
  Activity, ActivityKind, ListActivityVerb, Reply,
  Notification,
  ConversationSummary, ConversationDetail, DirectMessage,
} from "./types"

/* ── Auth ── */
export const register = (body: {
  email: string; username: string; displayName: string; password: string; referredBy?: string; inviteCode?: string
}) => api<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) })

/* ── Signup access (invite-only gate) ── */
export const getSignupConfig = () =>
  api<{ inviteOnly: boolean }>("/config/signup")

// Join the invite-only waitlist (public). Idempotent per email.
export const joinWaitlist = (email: string, source = "register", referredBy?: string) =>
  api<{ ok: true; alreadyOn: boolean }>("/waitlist", {
    method: "POST",
    body: JSON.stringify({ email, source, ...(referredBy ? { referredBy } : {}) }),
  })

export type SignupInvite = {
  id: string; code: string; label: string | null; maxUses: number; uses: number
  expiresAt: string | null; revokedAt: string | null; createdAt: string
}
export const adminGetSignupAccess = () =>
  api<{ inviteOnly: boolean; invites: SignupInvite[] }>("/admin/signup-access")
export const adminSetInviteOnly = (inviteOnly: boolean) =>
  api<{ inviteOnly: boolean }>("/admin/signup-access", { method: "PUT", body: JSON.stringify({ inviteOnly }) })
export const adminCreateInvite = (body: { label?: string; maxUses?: number; expiresInDays?: number }) =>
  api<SignupInvite>("/admin/signup-invites", { method: "POST", body: JSON.stringify(body) })
export const adminRevokeInvite = (id: string) =>
  api<SignupInvite>(`/admin/signup-invites/${id}`, { method: "DELETE" })

/* ── Referrals (invite link) ── */
export interface MyReferrals {
  count: number
  verifiedCount: number
  repEarned: number
  recent: { username: string; displayName: string; slug: string | null; avatarUrl: string | null; verified: boolean; joinedAt: string }[]
}
export const getMyReferrals = () => api<MyReferrals>("/users/me/referrals")

export const login = (body: { email: string; password: string }) =>
  api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) })

export const refresh = () => api<RefreshResponse>("/auth/refresh", { method: "POST" })

export const logout = () => api<void>("/auth/logout", { method: "POST" })

export const logoutAll = () => api<void>("/auth/logout-all", { method: "POST" })

export const changePassword = (body: { currentPassword: string; newPassword: string }) =>
  api<void>("/auth/change-password", { method: "POST", body: JSON.stringify(body) })

export const deleteAccount = (body: { password?: string } = {}) =>
  api<void>("/auth/delete-account", { method: "POST", body: JSON.stringify(body) })

export const exportMyData = () =>
  api<unknown>("/users/me/export")

export const me = () => api<{ user: User }>("/auth/me")

// Email verification (signup OTP). The user is logged in but unverified.
export const verifyEmail = (code: string) =>
  api<{ user: User }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ code }) })

export const resendVerification = () =>
  api<{ sent?: boolean; alreadyVerified?: boolean }>("/auth/resend-verification", { method: "POST" })

/* ── Link unfurl (Open Graph preview) ── */
import type { LinkPreview } from "./types"
export const getLinkPreview = (url: string) =>
  api<LinkPreview>(`/links/preview?url=${encodeURIComponent(url)}`)

/* ── Manga reading list ── */
import type { MangaEntry, MangaSearchResult } from "./types"
export const searchManga = (q: string) =>
  api<{ data: MangaSearchResult[] }>(`/readlist/search?q=${encodeURIComponent(q)}`)
export const getReadlist = (usernameOrSlug: string) =>
  api<{ data: MangaEntry[] }>(`/readlist/${encodeURIComponent(usernameOrSlug)}`)
export const addManga = (body: MangaSearchResult & { status?: string }) =>
  api<{ entry: MangaEntry }>("/readlist", { method: "POST", body: JSON.stringify(body) })
export const updateMangaEntry = (id: string, body: { status?: string; progress?: number; score?: number | null }) =>
  api<{ entry: MangaEntry }>(`/readlist/${id}`, { method: "PATCH", body: JSON.stringify(body) })
export const removeMangaEntry = (id: string) =>
  api<void>(`/readlist/${id}`, { method: "DELETE" })

/* ── Users ── */
export const getUser = (username: string) =>
  api<UserProfile>(`/users/${username}`)

export const updateMe = (body: { displayName?: string; bio?: string; avatarUrl?: string; coverImage?: string; emailOnNewMessage?: boolean }) =>
  api<{ user: User }>("/users/me", { method: "PATCH", body: JSON.stringify(body) })

export const updateSlug = (slug: string) =>
  api<{ user: User }>("/users/me/slug", { method: "PATCH", body: JSON.stringify({ slug }) })

/** Persist onboarding genres; returns endowed-progress starter picks. */
export const completeOnboarding = (favoriteGenres: string[]) =>
  api<{ user: User; endowed: Array<{ malId: number | null; title: string; imageUrl: string | null }> }>(
    "/users/me/onboarding",
    { method: "POST", body: JSON.stringify({ favoriteGenres }) }
  )

export const checkSlugAvailable = (slug: string) =>
  api<{ available: boolean; error?: string }>(`/users/slug-check?slug=${encodeURIComponent(slug)}`)

/** Change the @handle. Relationships (follows, blocks, DMs) are keyed by user id,
    so they survive the change — only the displayed handle + /u/:username URL move. */
export const changeUsername = (username: string) =>
  api<{ user: User }>("/users/me/username", { method: "PATCH", body: JSON.stringify({ username }) })

export const checkUsernameAvailable = (username: string) =>
  api<{ available: boolean; error?: string }>(`/users/username-check?username=${encodeURIComponent(username)}`)

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

export const getAnimeCharacters = (malId: number | string) =>
  api<{ data: AnimeCharacterEntry[] }>(`/anime/${malId}/characters`)
export const getAnimeStaff = (malId: number | string) =>
  api<{ data: AnimeStaffEntry[] }>(`/anime/${malId}/staff`)

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

/** Algorithm-ranked trending feed. Not cursor-paginated — returns top N.
 *  Backend: see posts.service.getTrending (HN-style score, follow boost,
 *  diversity cap, 60s cache). Personalized when the viewer is authenticated. */
export const getTrending = (limit = 20) =>
  api<{ data: Post[]; meta: { algorithm: string; count: number; personalized: boolean } }>(
    `/posts/trending?limit=${limit}`,
  )

/** "Not interested" — drops the post from this user's trending feed and,
 *  after 3+ hides of the same author, soft-blocks that author's other posts
 *  for this viewer. Per X's open-source weights, negative signals dominate. */
export const hidePost = (id: string) =>
  api<{ hidden: true }>(`/posts/${id}/not-interested`, { method: "POST" })

export const unhidePost = (id: string) =>
  api<{ hidden: false }>(`/posts/${id}/not-interested`, { method: "DELETE" })

/** Personalised "For You" anime recommendations.
 *  Backend: anime.service.getForYou — builds a taste profile from the
 *  user's list, scores candidates by genre+studio+era affinity, excludes
 *  already-listed items, caps 2 per studio. Cold-start (empty list)
 *  falls back to globally top-rated. */
export const getForYouAnime = (limit = 20) =>
  api<{ data: AnimeDTO[]; meta: { algorithm: string } }>(
    `/anime/for-you?limit=${limit}`,
  )

/** People-you-may-know suggestions.
 *  Backend: users.service.whoToFollow — FOAF density + taste similarity
 *  + recency + reputation. Returns { user, reason } so the UI can show
 *  why each person was suggested. */
export const getWhoToFollow = (limit = 10) =>
  api<{
    data: Array<{
      user: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "bio" | "reputation">
      reason: string
    }>
    meta: { algorithm: string; count: number }
  }>(`/users/suggestions?limit=${limit}`)

export const getPost = (id: string) =>
  api<{ post: Post; liked: boolean }>(`/posts/${id}`)

export const createPost = (body: { content: string; animeId?: string; imageUrl?: string; imageUrls?: string[]; galleryLayout?: "grid" | "carousel" }) =>
  api<{ post: Post }>("/posts", { method: "POST", body: JSON.stringify(body) })

export const deletePost = (id: string) =>
  api<void>(`/posts/${id}`, { method: "DELETE" })

export const likePost = (id: string) =>
  api<{ liked: boolean; count: number }>(`/posts/${id}/like`, { method: "POST" })

export const unlikePost = (id: string) =>
  api<{ liked: boolean; count: number }>(`/posts/${id}/like`, { method: "DELETE" })

export const getComments = (postId: string, page = 1) =>
  api<Paginated<PostComment>>(`/posts/${postId}/comments?page=${page}`)

export const createComment = (postId: string, content: string, parentCommentId?: string) =>
  api<{ comment: PostComment }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentCommentId }),
  })

export const getCommentReplies = (commentId: string, page = 1) =>
  api<Paginated<PostComment>>(`/posts/comments/${commentId}/replies?page=${page}`)

export const likeComment = (commentId: string) =>
  api<void>(`/posts/comments/${commentId}/like`, { method: "POST" })

export const unlikeComment = (commentId: string) =>
  api<void>(`/posts/comments/${commentId}/like`, { method: "DELETE" })

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
  api<{ data: Array<{ rank: number; id: string; username: string; displayName: string; avatarUrl: string | null; reputation: number; xp: number; level: number; archived: number; reviews: number; posts: number }>; meta: { total: number; period: string } }>(`/users/leaderboard/top?limit=${limit}&period=${period}`)

export interface PostLiker {
  id: string; username: string; slug: string | null; displayName: string
  avatarUrl: string | null; verifiedKind: "USER" | "CREATOR" | "STUDIO" | null
  isFollowedByMe: boolean; isMe: boolean
}
export const getPostLikers = (postId: string, page = 1, limit = 30) =>
  api<Paginated<PostLiker>>(`/posts/${postId}/likers?page=${page}&limit=${limit}`)

export const getBoardLeaderboard = (board: string, window: string, audience: string, limit = 50) =>
  api<import("./types").BoardLeaderboard>(
    `/users/leaderboard/boards?board=${board}&window=${window}&audience=${audience}&limit=${limit}`
  )

/* ── Chat (E2E encrypted DMs) ── */
export const uploadPublicKey = (publicKey: string) =>
  api<void>("/chat/keys/me", { method: "PUT", body: JSON.stringify({ publicKey }) })

export const getRecipientPublicKey = (userId: string) =>
  api<{ publicKey: string }>(`/chat/keys/${userId}`)

/* ── Opt-in E2EE vault (UMK wraps + device keys) ── */
export type E2eeWrap = { id: string; method: "PASSKEY_PRF" | "RECOVERY_CODE" | "FALLBACK_PASSPHRASE"; credentialId: string | null; label: string | null; wrappedUMK: string; wrapIv: string; kdfSalt: string | null; kdfParams: unknown; createdAt: string; lastUsedAt?: string | null }
export type E2eeDevice = { id: string; name: string; publicKey?: string; wrappedPrivKey?: string; wrapIv?: string; revoked?: boolean; lastSeenAt?: string; createdAt: string }
export type E2eeWrapInput = { method: "PASSKEY_PRF" | "RECOVERY_CODE" | "FALLBACK_PASSPHRASE"; credentialId?: string; wrappedUMK: string; wrapIv: string; kdfSalt?: string; kdfParams?: unknown; label?: string }
export type E2eeDeviceInput = { publicKey: string; wrappedPrivKey: string; wrapIv: string; name: string }

export const e2eeState = () =>
  api<{ hasE2EE: boolean; wraps: E2eeWrap[]; devices: E2eeDevice[] }>("/e2ee/state")
export const e2eeSetup = (body: { wraps: E2eeWrapInput[]; device: E2eeDeviceInput }) =>
  api<{ ok: boolean; device: E2eeDevice }>("/e2ee/setup", { method: "POST", body: JSON.stringify(body) })
export const e2eeAddWrap = (body: E2eeWrapInput) =>
  api<{ id: string }>("/e2ee/wraps", { method: "POST", body: JSON.stringify(body) })
export const e2eeRemoveWrap = (id: string) =>
  api<{ ok: boolean }>(`/e2ee/wraps/${id}`, { method: "DELETE" })
export const e2eeAddDevice = (body: E2eeDeviceInput) =>
  api<E2eeDevice>("/e2ee/devices", { method: "POST", body: JSON.stringify(body) })
export const e2eeRevokeDevice = (id: string) =>
  api<{ ok: boolean }>(`/e2ee/devices/${id}`, { method: "DELETE" })

/* ── WebAuthn (passkey) for the PRF key wrap ── */
export const webauthnRegisterOptions = () =>
  api<Record<string, unknown>>("/webauthn/register/options", { method: "POST", body: "{}" })
export const webauthnRegisterVerify = (response: unknown) =>
  api<{ verified: boolean; credentialId?: string }>("/webauthn/register/verify", { method: "POST", body: JSON.stringify({ response }) })
export const webauthnAuthOptions = () =>
  api<Record<string, unknown>>("/webauthn/auth/options", { method: "POST", body: "{}" })
export const webauthnAuthVerify = (response: unknown) =>
  api<{ verified: boolean }>("/webauthn/auth/verify", { method: "POST", body: JSON.stringify({ response }) })

export const listConversations = () =>
  api<{ conversations: ConversationSummary[] }>("/chat/conversations")

export const startConversation = (recipientId: string) =>
  api<{ conversation: ConversationDetail }>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ recipientId }),
  })

export const getConversation = (conversationId: string) =>
  api<{ conversation: ConversationDetail }>(`/chat/conversations/${conversationId}`)

export const searchMessages = (conversationId: string, q: string) =>
  api<{ data: Array<{ id: string; senderId: string; body: string; createdAt: string }> }>(
    `/chat/conversations/${conversationId}/search?q=${encodeURIComponent(q)}`)

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

/* ── Polls ── */
export const listPolls = (page = 1, limit = 20) =>
  api<Paginated<{ id: string; question: string; options: { id: string; text: string; votes: number }[]; totalVotes: number; createdAt: string; myVote?: string | null }>>(`/polls?page=${page}&limit=${limit}`)

export const createPoll = (body: { question: string; options: string[]; endsAt?: string }) =>
  api<{ poll: unknown }>("/polls", { method: "POST", body: JSON.stringify(body) })

export const votePoll = (pollId: string, optionId: string) =>
  api<{ poll: unknown }>(`/polls/${pollId}/vote`, { method: "POST", body: JSON.stringify({ optionId }) })

/* ── Blogs ── */
export const listBlogs = (page = 1, limit = 20, author?: string) =>
  api<Paginated<{ id: string; slug: string; title: string; body: string; coverImage?: string | null; author: { username: string; displayName: string; avatarUrl?: string | null }; createdAt: string; _count?: { likes: number } }>>(`/blogs${author ? `?author=${author}&` : "?"}page=${page}&limit=${limit}`)

/* ── Discovery (AI / Mood / Quiz) ── */
type DiscoveryAnimeMatch = { anime: AnimeDTO; match: number }
type DiscoveryResponse<E = unknown> = { data: DiscoveryAnimeMatch[]; meta: { count: number } } & E

export const discoverAI = (prompt: string, limit = 12) =>
  api<DiscoveryResponse<{ prompt: string; extractedGenres: string[] }>>(
    "/discovery/ai",
    { method: "POST", body: JSON.stringify({ prompt, limit }) },
  )

export const discoverMood = (
  mood: "uplifting" | "melancholic" | "intense" | "cozy" | "thrilling" | "romantic" | "thought-provoking" | "epic" | "lighthearted" | "dark",
  opts: { energy?: "low" | "medium" | "high"; depth?: "light" | "deep"; limit?: number } = {},
) =>
  api<DiscoveryResponse<{ mood: string; energy: string | null; depth: string | null }>>(
    "/discovery/mood",
    { method: "POST", body: JSON.stringify({ mood, ...opts }) },
  )

export const discoverQuiz = (answers: {
  favoriteGenre?: string
  preferredLength?: "movie" | "short" | "medium" | "long"
  tone?: "serious" | "funny" | "mixed"
  era?: "classic" | "modern" | "any"
  pacing?: "slow-burn" | "fast-paced" | "balanced"
}, limit = 12) =>
  api<DiscoveryResponse<{ answers: typeof answers }>>(
    "/discovery/quiz",
    { method: "POST", body: JSON.stringify({ answers, limit }) },
  )

/* ── Uploads (R2 presigned PUT) ── */
export type UploadIntent = {
  uploadUrl: string
  publicUrl: string
  key: string
  expiresIn: number
  contentType: string
  // Present for a size-enforced presigned POST — the client POSTs multipart
  // form-data (these fields + the file last). Absent → legacy presigned PUT.
  fields?: Record<string, string>
}

export const presignAvatarUpload = (contentType: string, size?: number) =>
  api<UploadIntent>("/uploads/avatar", {
    method: "POST",
    body: JSON.stringify({ contentType, size }),
  })

export const presignPostImageUpload = (contentType: string, size?: number) =>
  api<UploadIntent>("/uploads/post-image", {
    method: "POST",
    body: JSON.stringify({ contentType, size }),
  })

export const presignShotVideoUpload = (contentType: string, size: number) =>
  api<UploadIntent>("/uploads/shot-video", {
    method: "POST",
    body: JSON.stringify({ contentType, size }),
  })

/* ── Shots (video reels) ── */
export const createShot = (body: { videoUrl: string; thumbnailUrl?: string; caption?: string; durationMs?: number; animeId?: string }) =>
  api<{ shot: { id: string } }>("/shots", { method: "POST", body: JSON.stringify(body) })

/** Record a qualified Shot view (fired once per shot per session after the
    watch threshold). Server dedupes per viewer per day. See
    backend docs/shots-view-counting.md. */
export const recordShotView = (shotId: string, viewerKey: string, watchedMs?: number) =>
  api<{ viewCount: number; counted: boolean }>(`/shots/${shotId}/view`, {
    method: "POST",
    body: JSON.stringify({ viewerKey, watchedMs }),
  })

/** Negative feedback — "SKIP" (implicit fast scroll-away) or "NOT_INTERESTED"
    (explicit). Feeds the ranker's suppression loop. */
export const recordShotFeedback = (
  shotId: string,
  viewerKey: string,
  kind: "SKIP" | "NOT_INTERESTED",
  watchedMs?: number,
) =>
  api<{ ok: boolean; counted: boolean }>(`/shots/${shotId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ viewerKey, kind, watchedMs }),
  })

/* ── Search ── */
export const search = (
  q: string,
  type: "anime" | "posts" | "threads" | "users" | "blogs" = "anime",
  page = 1,
) => api<Paginated<unknown>>(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`)

/* ── Activities (feed §12 MVP) ── */
export type FeedType = "following" | "global" | "profile"

export interface CreateActivityBody {
  kind: ActivityKind
  body?: string
  linkedAnimeId?: string
  verb?: ListActivityVerb
  episodeNumber?: number
  score?: number
  wallOwnerId?: string
  hasSpoiler?: boolean
}

export const getActivityFeed = (type: FeedType = "global", cursor?: string, userId?: string, limit = 20) => {
  const qs = new URLSearchParams({ type, limit: String(limit) })
  if (cursor) qs.set("cursor", cursor)
  if (userId) qs.set("userId", userId)
  return api<CursorPaginated<Activity>>(`/activities/feed?${qs.toString()}`)
}

export const getActivity = (id: string) =>
  api<{ activity: Activity }>(`/activities/${id}`)

export const createActivity = (body: CreateActivityBody) =>
  api<{ activity: Activity }>("/activities", { method: "POST", body: JSON.stringify(body) })

export const deleteActivity = (id: string) =>
  api<void>(`/activities/${id}`, { method: "DELETE" })

export const likeActivity = (id: string) =>
  api<void>(`/activities/${id}/like`, { method: "POST" })

export const unlikeActivity = (id: string) =>
  api<void>(`/activities/${id}/like`, { method: "DELETE" })

export const repostActivity = (id: string, body?: string) =>
  api<{ activity: Activity }>(`/activities/${id}/repost`, {
    method: "POST",
    body: JSON.stringify(body !== undefined ? { body } : {}),
  })

export const unrepostActivity = (id: string) =>
  api<void>(`/activities/${id}/repost`, { method: "DELETE" })

export const getReplies = (activityId: string, cursor?: string) =>
  api<CursorPaginated<Reply>>(`/activities/${activityId}/replies${cursor ? `?cursor=${cursor}` : ""}`)

export const createReply = (activityId: string, body: { body: string; parentReplyId?: string; hasSpoiler?: boolean }) =>
  api<{ reply: Reply }>(`/activities/${activityId}/replies`, {
    method: "POST",
    body: JSON.stringify(body),
  })
