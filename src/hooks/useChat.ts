"use client"

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/auth.store"
import * as ep from "@/lib/api/endpoints"
import { getSocket } from "@/lib/socket"
import type { DirectMessage } from "@/lib/api/types"

// ── Conversations ─────────────────────────────────────────────────────────────

export function useConversations() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn:  () => ep.listConversations().then(r => r.conversations),
    enabled:  isAuthenticated,
    staleTime: 20_000,
  })
}

export function useStartConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (recipientId: string) => ep.startConversation(recipientId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["chat", "conversations"] }),
  })
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey:         ["chat", "messages", conversationId],
    queryFn:          ({ pageParam }) =>
      ep.getMessages(conversationId!, pageParam as string | undefined),
    getNextPageParam: page => page.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled:          !!conversationId,
    staleTime:        10_000,
    // Don't refetch on window focus — messages come through socket
    refetchOnWindowFocus: false,
  })
}

type MsgCache = { pages: { messages: DirectMessage[]; nextCursor: string | null }[]; pageParams: unknown[] }

/**
 * Inject a new message into the front of the first page.
 * Handles three cases:
 *   1. Cache is completely absent (brand-new conversation, never fetched)
 *   2. Cache exists but pages array is empty
 *   3. Normal case — prepend to pages[0]
 */
function injectMessage(old: MsgCache | undefined, msg: DirectMessage): MsgCache | undefined {
  if (!old) {
    // Bootstrap cache for a conversation that has never been fetched
    return { pages: [{ messages: [msg], nextCursor: null }], pageParams: [undefined] }
  }

  const pages = [...old.pages]

  // Guard: pages might be empty (e.g. query ran but returned nothing)
  if (!pages[0]) {
    pages[0] = { messages: [msg], nextCursor: null }
    return { ...old, pages }
  }

  // Avoid duplicate injection (socket may fire before send-mutation onSuccess)
  if (pages[0].messages.some(m => m.id === msg.id)) return old

  pages[0] = { ...pages[0], messages: [msg, ...pages[0].messages] }
  return { ...old, pages }
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ciphertext, iv }: { ciphertext: string; iv: string }) =>
      ep.sendEncryptedMessage(conversationId, ciphertext, iv),
    onSuccess: (data) => {
      qc.setQueryData<MsgCache>(
        ["chat", "messages", conversationId],
        old => injectMessage(old, data.message),
      )
      // Refresh conversation list order (last-message sort)
      qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
    },
    // onError handled in the page via mutation.isError / mutation.error
  })
}

export function useMarkRead(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ep.markConversationRead(conversationId) as Promise<{ readAt: string; conversationId: string }>,
    onSuccess: ({ readAt }: { readAt?: string; conversationId?: string }) => {
      // Update readAt on all received messages in cache — no full refetch needed
      qc.setQueryData<MsgCache>(
        ["chat", "messages", conversationId],
        old => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map(p => ({
              ...p,
              messages: p.messages.map(m =>
                !m.readAt ? { ...m, readAt: readAt ?? new Date().toISOString() } : m
              ),
            })),
          }
        },
      )
      // Also refresh conversation list (unread badge clears)
      qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
    },
  })
}

// ── Real-time socket wiring ───────────────────────────────────────────────────

export function useChatSocket(conversationId: string | null) {
  const qc      = useQueryClient()
  const convRef = useRef(conversationId)
  convRef.current = conversationId

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let cleanup: (() => void) | undefined

    function attach() {
      const socket = getSocket()

      // Socket not ready yet — retry until it connects
      if (!socket) {
        retryTimer = setTimeout(attach, 800)
        return
      }

      const onMessage = (msg: DirectMessage) => {
        const cid = convRef.current

        // Inject into the active conversation's cache
        if (cid && msg.conversationId === cid) {
          qc.setQueryData<MsgCache>(
            ["chat", "messages", cid],
            old => injectMessage(old, msg),
          )
        }

        // Always refresh conversation list (unread badge / last-message preview)
        qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
      }

      const onRead = ({ conversationId: cid, readAt }: { conversationId: string; readAt: string }) => {
        // The other user read our messages — update their readAt stamps
        qc.setQueryData<MsgCache>(
          ["chat", "messages", cid],
          old => {
            if (!old) return old
            return {
              ...old,
              pages: old.pages.map(p => ({
                ...p,
                messages: p.messages.map(m =>
                  !m.readAt ? { ...m, readAt } : m
                ),
              })),
            }
          },
        )
        qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
      }

      socket.on("chat.message", onMessage)
      socket.on("chat.read",    onRead)

      cleanup = () => {
        socket.off("chat.message", onMessage)
        socket.off("chat.read",    onRead)
      }
    }

    attach()

    return () => {
      if (retryTimer) clearTimeout(retryTimer)
      cleanup?.()
    }
  }, [qc])
}
