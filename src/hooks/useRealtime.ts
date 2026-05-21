"use client"

/**
 * Realtime listeners — connects React-Query caches to Socket.io broadcast events.
 *
 * Each hook subscribes to a specific channel + event set. Mount the hook on the
 * page that should react to those events. Listeners self-cleanup on unmount.
 *
 * Backend emits these events from app/src/realtime/broadcast.ts.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { useAuthStore } from "@/stores/auth.store"
import type { Post } from "@/lib/api/types"

// ── Generic "join a room while this hook is mounted" helper ──────────────────

function useRoomMembership(roomName: string | null) {
  useEffect(() => {
    if (!roomName) return
    const tryJoin = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(tryJoin, 600); return }
      s.emit("room:join", roomName)
    }
    let retry: ReturnType<typeof setTimeout> | null = null
    tryJoin()
    return () => {
      if (retry) clearTimeout(retry)
      const s = getSocket()
      if (s) s.emit("room:leave", roomName)
    }
  }, [roomName])
}

// ── Live community feed ──────────────────────────────────────────────────────
// Every connected user is auto-joined to the "feed" room on backend connect,
// so we only need to listen here.

type UseLiveFeedOptions = {
  /**
   * When provided, new posts arriving via socket are NOT auto-prepended to the
   * cache — instead they are buffered and the caller is notified via callback.
   * Use this when the page wants to show a "↑ N new posts" banner so the
   * scroll position doesn't jump while the user is reading older content.
   */
  onQueue?: (post: Post) => void
}

export function useLiveFeed(opts: UseLiveFeedOptions = {}) {
  const qc = useQueryClient()
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const onQueueRef = useRef(opts.onQueue)
  useEffect(() => { onQueueRef.current = opts.onQueue }, [opts.onQueue])

  useEffect(() => {
    if (!isAuth) return
    let cleanup: (() => void) | null = null

    const attach = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(attach, 600); return }

      const onCreated = (post: Post) => {
        // If a queue callback is registered, hand off without touching the cache.
        // Caller will flush queued posts into the cache when the user opts in.
        if (onQueueRef.current) {
          onQueueRef.current(post)
          return
        }
        // Otherwise, prepend immediately
        qc.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ["posts/discover"] }, (old) => {
          if (!old || !old.pages?.length) return old
          return { ...old, pages: [{ ...old.pages[0], data: [post, ...old.pages[0].data] }, ...old.pages.slice(1)] }
        })
        qc.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ["posts/feed"] }, (old) => {
          if (!old || !old.pages?.length) return old
          return { ...old, pages: [{ ...old.pages[0], data: [post, ...old.pages[0].data] }, ...old.pages.slice(1)] }
        })
      }

      const onLiked = ({ postId, likes }: { postId: string; likes: number }) => {
        updatePostInAllCaches(qc, postId, (p) => ({ ...p, _count: { ...(p._count ?? { likes: 0, comments: 0 }), likes } }))
      }
      const onUnliked = onLiked  // same handler shape

      const onCommented = ({ postId, comments }: { postId: string; comments: number }) => {
        updatePostInAllCaches(qc, postId, (p) => ({ ...p, _count: { ...(p._count ?? { likes: 0, comments: 0 }), comments } }))
      }

      const onDeleted = ({ postId }: { postId: string }) => {
        ;(["posts/discover", "posts/feed"] as const).forEach(key => {
          qc.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: [key] }, (old) => {
            if (!old) return old
            return { ...old, pages: old.pages.map(p => ({ ...p, data: p.data.filter(x => x.id !== postId) })) }
          })
        })
      }

      s.on("post.created",   onCreated)
      s.on("post.liked",     onLiked)
      s.on("post.unliked",   onUnliked)
      s.on("post.commented", onCommented)
      s.on("post.deleted",   onDeleted)

      cleanup = () => {
        s.off("post.created",   onCreated)
        s.off("post.liked",     onLiked)
        s.off("post.unliked",   onUnliked)
        s.off("post.commented", onCommented)
        s.off("post.deleted",   onDeleted)
      }
    }

    let retry: ReturnType<typeof setTimeout> | null = null
    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [isAuth, qc])
}

/**
 * Helper for the "↑ N new posts" floating banner pattern.
 *
 * Returns:
 *  - `queueLength`: number of new posts buffered while user is scrolled
 *  - `enqueue`: pass to `useLiveFeed({ onQueue })` to buffer posts
 *  - `flush()`: drain the queue into the React-Query cache (caller scrolls to top after)
 */
export function useQueuedPosts(queryKeys: ReadonlyArray<readonly [string]>) {
  const qc = useQueryClient()
  const [queueLength, setQueueLength] = useState(0)
  const queueRef = useRef<Post[]>([])

  const enqueue = useCallback((post: Post) => {
    queueRef.current = [post, ...queueRef.current]
    setQueueLength(queueRef.current.length)
  }, [])

  const flush = useCallback(() => {
    const queued = queueRef.current
    if (queued.length === 0) return
    queueRef.current = []
    setQueueLength(0)
    for (const [key] of queryKeys) {
      qc.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: [key] }, (old) => {
        if (!old || !old.pages?.length) return old
        return { ...old, pages: [{ ...old.pages[0], data: [...queued, ...old.pages[0].data] }, ...old.pages.slice(1)] }
      })
    }
  }, [qc, queryKeys])

  return { queueLength, enqueue, flush }
}

function updatePostInAllCaches(qc: ReturnType<typeof useQueryClient>, postId: string, update: (p: Post) => Post) {
  ;(["posts/discover", "posts/feed"] as const).forEach(key => {
    qc.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: [key] }, (old) => {
      if (!old) return old
      return { ...old, pages: old.pages.map(p => ({ ...p, data: p.data.map(x => x.id === postId ? update(x) : x) })) }
    })
  })
}

// ── User presence ────────────────────────────────────────────────────────────

const presenceListeners = new Set<(online: Set<string>) => void>()
let presenceOnline = new Set<string>()
let presenceWired  = false

function ensurePresenceWired() {
  if (presenceWired) return
  const s = getSocket()
  if (!s) return
  presenceWired = true

  s.on("presence.snapshot", ({ online }: { online: string[] }) => {
    presenceOnline = new Set(online)
    presenceListeners.forEach(fn => fn(presenceOnline))
  })
  s.on("presence.online", ({ userId }: { userId: string }) => {
    presenceOnline.add(userId)
    presenceListeners.forEach(fn => fn(new Set(presenceOnline)))
  })
  s.on("presence.offline", ({ userId }: { userId: string }) => {
    presenceOnline.delete(userId)
    presenceListeners.forEach(fn => fn(new Set(presenceOnline)))
  })
}

/** Returns true if `userId` is currently online */
export function usePresence(userId: string | null | undefined): boolean {
  const [online, setOnline] = useState(presenceOnline)
  useEffect(() => {
    if (!userId) return
    ensurePresenceWired()
    presenceListeners.add(setOnline)
    // Retry wiring if socket wasn't ready on mount
    const retryTimer = setTimeout(ensurePresenceWired, 700)
    return () => {
      clearTimeout(retryTimer)
      presenceListeners.delete(setOnline)
    }
  }, [userId])
  return userId ? online.has(userId) : false
}

// ── Global online count (cheap shared subscription) ──────────────────────────

const onlineCountListeners = new Set<(n: number) => void>()
let onlineCount = 0
let onlineCountWired = false

function ensureOnlineCountWired() {
  if (onlineCountWired) return
  const s = getSocket()
  if (!s) return
  onlineCountWired = true
  s.on("presence.count", ({ online }: { online: number }) => {
    onlineCount = online
    onlineCountListeners.forEach(fn => fn(online))
  })
}

/** Returns the total number of currently-online users on the platform */
export function useOnlineCount(): number {
  const [n, setN] = useState(onlineCount)
  useEffect(() => {
    ensureOnlineCountWired()
    onlineCountListeners.add(setN)
    const retryTimer = setTimeout(ensureOnlineCountWired, 700)
    return () => {
      clearTimeout(retryTimer)
      onlineCountListeners.delete(setN)
    }
  }, [])
  return n
}

// ── Live anime page (user-stats counter + new reviews) ───────────────────────

export function useLiveAnime(malId: number | null) {
  const qc = useQueryClient()
  useRoomMembership(malId ? `anime:${malId}` : null)

  useEffect(() => {
    if (!malId) return
    let cleanup: (() => void) | null = null

    const attach = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(attach, 600); return }

      const onListChanged = () => {
        // Refetch the user-stats query so the "X watching" counter updates
        qc.invalidateQueries({ queryKey: ["anime-user-stats", String(malId)] })
      }
      const onReview = () => {
        qc.invalidateQueries({ queryKey: ["anime-reviews", String(malId)] })
      }

      s.on("anime.list-changed", onListChanged)
      s.on("review.created",     onReview)

      cleanup = () => {
        s.off("anime.list-changed", onListChanged)
        s.off("review.created",     onReview)
      }
    }

    let retry: ReturnType<typeof setTimeout> | null = null
    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [malId, qc])
}

// ── Live user-list sync (your own watchlist across tabs/devices) ─────────────

export function useLiveUserList() {
  const qc = useQueryClient()
  const isAuth = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    if (!isAuth) return
    let cleanup: (() => void) | null = null

    const attach = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(attach, 600); return }

      const onChanged = ({ malId }: { malId: number; status: string | null }) => {
        // Refetch my list (any username key), user-stats, and the anime detail entry
        qc.invalidateQueries({ queryKey: ["user-list"] })
        qc.invalidateQueries({ queryKey: ["watchlist"] })
        qc.invalidateQueries({ queryKey: ["my-list-entry", String(malId)] })
        qc.invalidateQueries({ queryKey: ["anime-user-stats", String(malId)] })
        qc.invalidateQueries({ queryKey: ["streak"] })
      }

      s.on("list.changed", onChanged)
      cleanup = () => { s.off("list.changed", onChanged) }
    }

    let retry: ReturnType<typeof setTimeout> | null = null
    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [isAuth, qc])
}

// ── Live thread (club discussions, anime discuss) ────────────────────────────

export function useLiveThread(threadId: string | null) {
  const qc = useQueryClient()
  useRoomMembership(threadId ? `thread:${threadId}` : null)

  useEffect(() => {
    if (!threadId) return
    let cleanup: (() => void) | null = null

    const attach = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(attach, 600); return }

      const onReply = () => {
        qc.invalidateQueries({ queryKey: ["replies", threadId] })
        qc.invalidateQueries({ queryKey: ["thread",  threadId] })
      }

      s.on("thread.reply", onReply)
      cleanup = () => { s.off("thread.reply", onReply) }
    }

    let retry: ReturnType<typeof setTimeout> | null = null
    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [threadId, qc])
}
