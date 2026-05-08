# User flows (frontend perspective)

Same flows as the backend's `flows.md`, viewed from the frontend side. Each flow lists screens, components touched, hooks fired, and state changes. Cross-reference with `docs/peer/backend-api-contract.md` for the API shapes.

## Flow 1 — Register and first session

| Step | Page / Component                              | Hook / Action                                  | State change                                        |
| ---- | --------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| 1    | `app/(auth)/register/page.tsx`                | RHF + Zod form                                 |                                                     |
| 2    | Submit                                        | `useMutation(register)`                        |                                                     |
| 3    | Receive `{ user, accessToken }`               | `useAuth.setAccess(accessToken)`               | Zustand: accessToken in memory                       |
| 4    | Refresh cookie set by backend (httpOnly)      |                                                | Browser cookie store                                 |
| 5    | `router.push('/')`                            |                                                |                                                     |
| 6    | `app/(main)/layout.tsx` mounts                | `connectSocket(accessToken)` in `lib/socket.ts` | Socket.io connection live                          |
| 7    | Home feed                                     | `useDiscover()` (no follows yet)                |                                                     |

## Flow 2 — Browse → track an anime

| Step | Page / Component                                            | Hook / Action                  | State change                              |
| ---- | ----------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| 1    | `app/(main)/anime/season/[year]/[season]/page.tsx` (SSR)    | server `fetch` to backend      | Hydrated TanStack cache for the season    |
| 2    | `<AnimeCard>` click → `app/(main)/anime/[id]/page.tsx`      | `useAnime(id)`                 |                                           |
| 3    | `<ListStatusWidget>` opens → user picks status              | `useUpsertListEntry(id)`        | Optimistic: local cache updated instantly |
| 4    | On success                                                  |                                | Toast "Added to list"                     |
| 5    | On error                                                    | `onError` rollback              | Toast "Couldn't save, try again"          |

## Flow 3 — Post + notification

Two users, two browser tabs.

### User A (sender)

| Step | Page / Component                       | Hook / Action               | State change                              |
| ---- | -------------------------------------- | --------------------------- | ----------------------------------------- |
| 1    | `<PostComposer>` on `/`                | RHF; char counter           |                                           |
| 2    | Mention `@userB` → autocomplete dropdown | `useSearchUsers(prefix)`   |                                           |
| 3    | Submit                                 | `useMutation(createPost)`   | Optimistic insert at top of feed          |

### User B (recipient)

| Step | Page / Component               | Hook / Action / Event                                      | State change                          |
| ---- | ------------------------------ | ---------------------------------------------------------- | ------------------------------------- |
| 1    | (any page; layout-level)       | Socket: `notification.new` event fires                     | `notifications.store.unreadCount++`   |
| 2    | `<NotificationBell>` (header)  | re-renders with badge                                      |                                       |
| 3    | Toast appears (top-right)      | from layout-level subscriber                               |                                       |
| 4    | User clicks bell               | `<NotificationList>` opens                                  | `useNotifications()` fetches list     |
| 5    | Click row → `/posts/:id`       | `usePost(id)`                                              | Server-side mark-read on backend      |

## Flow 4 — Discussion thread in a club

| Step | Page / Component                             | Hook / Action                                | State change                            |
| ---- | -------------------------------------------- | -------------------------------------------- | --------------------------------------- |
| 1    | `app/(main)/clubs/[slug]/page.tsx`           | `useClub(slug)` + `useClubThreads(slug)`     |                                         |
| 2    | "Join" button                                 | `useMutation(joinClub)`                      | Optimistic toggle                        |
| 3    | "New thread" → `<ThreadComposer>` modal       | RHF + markdown editor                        |                                         |
| 4    | Submit                                        | `useMutation(createClubThread)`              | Push to thread list cache                |
| 5    | Other user replies (any tab)                  | (this user) Socket fires `thread.replied` v1.1 | `useReplies` invalidate or push-merge  |

## Flow 5 — Review on anime

| Step | Page / Component                            | Hook / Action                  | State change                       |
| ---- | ------------------------------------------- | ------------------------------ | ---------------------------------- |
| 1    | `<AnimeHero>` "Write review" button         | open `<ReviewComposer>` modal  |                                    |
| 2    | RHF: rating 1–10, body markdown, spoiler    |                                |                                    |
| 3    | Submit                                      | `useMutation(createReview)`    | Push into reviews cache for anime  |
| 4    | Visible on anime page                       | `useAnimeReviews(id, 'helpful')` |                                  |

## Flow 6 — Search

| Step | Page / Component                       | Hook / Action                                  | State change                            |
| ---- | -------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| 1    | Header search input                    | `useDebouncedValue(q, 250)` → autocomplete     | Dropdown shows top-5 results            |
| 2    | Press Enter / click "see all" → `/search?q=` | `useSearch(q, type)` per active tab        |                                         |
| 3    | Tab switch (anime, posts, threads, …)  | re-runs `useSearch(q, newType)`                |                                         |

## Flow 7 — Moderation

| Step | Actor | Page / Component                            | Hook / Action                 | State change                    |
| ---- | ----- | ------------------------------------------- | ----------------------------- | ------------------------------- |
| 1    | User  | "Report" in `<PostCard>` menu               | `<ReportModal>`               |                                 |
| 2    | User  | Pick reason + submit                         | `useMutation(createReport)`   | Toast "Report received"         |
| 3    | Mod   | `app/(main)/admin/moderation/page.tsx`       | `useReports({ status: 'OPEN' })`| Queue list                    |
| 4    | Mod   | Action button → "Hide post"                 | `useMutation(createAction)`   | Optimistic remove from queue    |

## Flow 8 — Refresh token rotation (transparent)

| Step | Trigger                                | Where                             | What happens                                          |
| ---- | -------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| 1    | Any API call returns 401               | `lib/api/client.ts` interceptor   | Single-flight `refreshTokenOnce()`                    |
| 2    | New access token received              | `lib/auth/store.ts`               | `setAccess(newToken)`; queued requests resume         |
| 3    | Socket needs new token (post-refresh)  | `lib/socket.ts`                    | re-emits `auth_update` event with new token (or reconnects) |
| 4    | Refresh fails                          | `client.ts`                       | `useAuth.clear()`; `router.replace('/login?next=…')` |

The user sees nothing during a successful rotation; the only side effect is a brief loading state on the request that triggered it.
