# Frontend progress (Kanban)

Format: each phase has Todo / Doing / Done. Move tickets between sections as work progresses. When done, append the commit hash in parentheses, e.g. `- [x] /login page (a3f1b2c)`.

Update on every PR merge.

---

## Phase 0 — Bootstrap

### Todo
- [ ] Tailwind 4 config + design tokens
- [ ] shadcn/ui init and primitive baseline
- [ ] `.env.example` with `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_SOCKET_URL`
- [ ] CI workflow on GitHub Actions (lint, typecheck, build, test)

### Doing

### Done
- [x] `npx create-next-app@latest` (App Router, TS, Tailwind, ESLint) (595b5dc)
- [x] TanStack Query provider in `app/layout.tsx` (9e05984)
- [x] Zustand auth store skeleton (9e05984)
- [x] `lib/api/client.ts` with refresh interceptor (9e05984)
- [x] `.env.example` (9e05984)
- [x] Header + Footer + Sidebar layout shell (ce2df24)
- [x] 404 page (b31a42a)

---

## Phase 1 — Identity

### Todo
- [ ] `lib/auth/store.ts` — wire real accessToken (replace mockAuth localStorage)
- [ ] After-login: redirect to `?next=` if present
- [ ] `app/(auth)/register/page.tsx` real OAuth + email/password form

### Doing

### Done
- [x] `app/(public)/login/page.tsx` with OAuth buttons (ab6dd7b)
- [x] `app/(public)/register/page.tsx` email+password + OAuth (ab6dd7b)
- [x] `lib/auth/useSession.ts` hook (e50d858)
- [x] `client.ts`: refresh interceptor + single-flight (9e05984)
- [x] `endpoints.ts`: register, login, logout, logoutAll, me (9e05984)
- [x] `hooks/useAuth.ts`: useLogin, useRegister, useLogout, useMe (9e05984)
- [x] `app/(dashboard)/settings/page.tsx` (account, notifications, appearance, privacy) (ce2df24)
- [x] `app/(dashboard)/profile/page.tsx` with Anime DNA, activity timeline (0fcd4a6)

---

## Phase 2 — Catalog

### Todo
- [ ] Wire `app/(public)/bestanimelist/page.tsx` to real API (currently ANIME_DB static)
- [ ] `hooks/useAnime.ts`: complete hooks (9e05984)

### Done
- [x] `app/(public)/anime/[id]/page.tsx` full detail page (0fcd4a6)
- [x] `app/(public)/bestanimelist/page.tsx` (filters, modal, 24 anime) (14bb8dc)
- [x] `app/(public)/search/page.tsx` (tabs: anime/users/posts) (0fcd4a6)
- [x] `app/(public)/ai-discover/page.tsx` (prompt → results) (14bb8dc)
- [x] `<AnimeCard>` with watchlist +/- button (14bb8dc)
- [x] `<AnimeModal>` with real data + Full Page link (c77f4ab)
- [x] `hooks/useAnime.ts` (9e05984)
- [x] Header search box debounced autocomplete (Cmd+K) (14bb8dc)

---

## Phase 3 — Tracking

### Todo
- [ ] Wire `<ListStatusWidget>` to real API (optimistic updates)
- [ ] Wire `/watchlist` page to `GET /lists/me`

### Done
- [x] `<WatchCard>` with context menu (Done/Edit/Remove) (b31a42a)
- [x] `app/(dashboard)/watchlist/page.tsx` (8 entries, search, filters) (b31a42a)
- [x] `app/(dashboard)/readlist/page.tsx` (8 manga, filters) (b31a42a)
- [x] `hooks/useLists.ts` (e50d858)

---

## Phase 4 — Social v1

### Todo
- [ ] Wire community feed to real `GET /posts/discover`
- [ ] Wire post creation to real `POST /posts`
- [ ] Wire socket for live notifications

### Done
- [x] `app/(public)/community/page.tsx` (feed, composer, sidebar) (0fcd4a6)
- [x] `lib/socket.ts` singleton + JWT handshake (e50d858)
- [x] `stores/notifications.store.ts` (from useNotifications hook)
- [x] `<NotificationBell>` in header (14bb8dc)
- [x] `app/(dashboard)/notifications/page.tsx` (ce2df24)
- [x] `hooks/usePosts.ts` (9e05984)
- [x] `hooks/useNotificationsQuery.ts` (e50d858)

---

## Phase 5 — Community

### Todo
- [ ] `app/(main)/clubs/page.tsx` index
- [ ] `app/(main)/threads/[id]/page.tsx`

### Doing

### Done
- [x] `app/(public)/community/page.tsx` with post feed, polls sidebar (0fcd4a6)
- [x] `app/(public)/poll/page.tsx` full interactive polls hub (c77f4ab)

---

## Phase 6 — Long-form

### Todo
- [ ] Wire blogs to real API

### Done
- [x] `app/(creator)/creators/create/blog/page.tsx` editor (98f73b1)
- [x] `app/(creator)/creators/blog/page.tsx` listing (98f73b1)
- [x] Creator Studio complete (feed/blog/polls/analytics/create) (ce2df24)

---

## Phase 7 — Moderation

### Todo
- [ ] "Report" menu item on content cards
- [ ] `/admin/moderation` queue

---

## Phase 8 — Polish + launch

### Todo
- [ ] Skeleton loaders on every async surface (partially done)
- [ ] i18n scaffold

### Done
- [x] Sentry frontend: @sentry/nextjs installed; sentry.client/server/edge.config.ts with conditional init; withSentryConfig in next.config.ts (90f3141)
- [x] Sentry backend: @sentry/node installed; init in app.ts; captureException in error middleware; SENTRY_DSN in .env.example (c266f31)
- [x] PWA service worker: public/sw.js (network-first API, cache-first static, offline fallback); public/offline.html; SW registered in root layout (90f3141)
- [x] Fix production auth redirect loop: (auth)/layout.tsx now waits for sessionReady, redirects to /user/{slug}/dashboard directly (90f3141)
- [x] Performance: manifest.ts theme_color changed to gold #f59e0b; viewport export (themeColor, initialScale) in root layout (90f3141)
- [x] Skeleton components (39bd375)
- [x] 3D TiltCard component (c77f4ab)
- [x] ToastContainer globally mounted (14bb8dc)
- [x] 404 page (b31a42a)
- [x] Mobile navbar dropdown (39bd375)
- [x] Footer complete 4-column (39bd375)

---

## Cross-cutting (continuous)

### Todo
- [ ] Replace mockAuth localStorage with Zustand memory-only
- [ ] Sync `docs/peer/backend-api-contract.md` when backend updates
- [ ] Keep `docs/api-client.md` endpoint inventory aligned with `endpoints.ts`
- [ ] Keep `docs/tests.md` in sync with new test plans

### Done
- [x] CLAUDE.md created with full project guide (a9ad1ad)
- [x] lib/api/client.ts, endpoints.ts, types.ts (9e05984)
- [x] Zustand auth.store.ts (memory-only access token) (9e05984)
