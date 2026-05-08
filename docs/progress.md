# Frontend progress (Kanban)

Format: each phase has Todo / Doing / Done. Move tickets between sections as work progresses. When done, append the commit hash in parentheses, e.g. `- [x] /login page (a3f1b2c)`.

Update on every PR merge.

---

## Phase 0 — Bootstrap

### Todo
- [ ] `npx create-next-app@latest` (App Router, TS, Tailwind, ESLint)
- [ ] Tailwind 4 config + design tokens
- [ ] shadcn/ui init (`npx shadcn@latest init`) and a baseline of primitives (button, input, dialog, dropdown-menu, toast, tabs, avatar)
- [ ] TanStack Query provider in `app/layout.tsx`
- [ ] Zustand auth store skeleton
- [ ] `lib/api/client.ts` skeleton (no refresh yet — Phase 1 finishes it)
- [ ] `.env.example` with `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_SOCKET_URL`
- [ ] CI workflow on GitHub Actions (lint, typecheck, build, test)
- [ ] Header + Footer + Sidebar layout shell
- [ ] 404 page

### Doing

### Done

---

## Phase 1 — Identity

### Todo
- [ ] `app/(auth)/login/page.tsx` with RHF + Zod
- [ ] `app/(auth)/register/page.tsx`
- [ ] `lib/auth/store.ts` (Zustand: accessToken in memory, setAccess, clear)
- [ ] `lib/auth/useSession.ts` hook
- [ ] `client.ts`: refresh interceptor + single-flight
- [ ] `endpoints.ts`: register, login, logout, logoutAll, me
- [ ] After-login: redirect to `?next=` if present
- [ ] `app/(main)/settings/page.tsx` (display name, bio, avatar URL)
- [ ] `app/(main)/u/[username]/page.tsx` (SSR shell)
- [ ] `<FollowButton>` on profile

### Doing

### Done

---

## Phase 2 — Catalog

### Todo
- [ ] `app/(main)/anime/[id]/page.tsx` (SSR for shell, client widgets)
- [ ] `<AnimeHero>` (image, title, score, genres)
- [ ] `<AnimeCard>` (used across browse + search)
- [ ] `app/(main)/anime/season/[year]/[season]/page.tsx` (SSR with filters)
- [ ] `<SeasonFilter>` client component
- [ ] Header search box: debounced autocomplete with `useDebouncedValue`
- [ ] `app/(main)/search/page.tsx` (tabs: anime, posts, threads, users, blogs)
- [ ] `hooks/useAnime.ts` and friends

### Doing

### Done

---

## Phase 3 — Tracking

### Todo
- [ ] `<ListStatusWidget>` (inline status + advanced modal)
- [ ] `hooks/useLists.ts` with optimistic updates
- [ ] `app/(main)/u/[username]/list/page.tsx` (filterable, sortable)
- [ ] List status enum + colors in design system

### Doing

### Done

---

## Phase 4 — Social v1

### Todo
- [ ] `<PostComposer>` with mention autocomplete
- [ ] `<PostCard>` (avatar, content, like, comment, share, attached anime)
- [ ] `<PostFeed>` infinite scroll via `useIntersection`
- [ ] `app/(main)/page.tsx` home feed
- [ ] `app/(main)/discover/page.tsx`
- [ ] `app/(main)/posts/[id]/page.tsx` with comments
- [ ] `lib/socket.ts` singleton + JWT handshake
- [ ] `stores/notifications.store.ts` (unreadCount, recent items)
- [ ] `<NotificationBell>` in header (live updating)
- [ ] `app/(main)/notifications/page.tsx`
- [ ] Toast on `notification.new`

### Doing

### Done

---

## Phase 5 — Community

### Todo
- [ ] `app/(main)/clubs/page.tsx` index
- [ ] `app/(main)/clubs/new/page.tsx` create form
- [ ] `app/(main)/clubs/[slug]/page.tsx`
- [ ] `<ClubHeader>` with join/leave
- [ ] `app/(main)/threads/[id]/page.tsx`
- [ ] `<ThreadComposer>` with markdown
- [ ] `<ReplyTree>` recursive component with collapse/expand
- [ ] Spoiler tag rendering in `lib/utils/markdown.ts`

### Doing

### Done

---

## Phase 6 — Long-form

### Todo
- [ ] `<ReviewComposer>` modal
- [ ] `<ReviewCard>` on anime page
- [ ] `app/(main)/blog/page.tsx` index
- [ ] `app/(main)/blog/new/page.tsx` editor
- [ ] `app/(main)/blog/[slug]/page.tsx` reader (SSR)
- [ ] `<BlogEditor>` markdown component (dynamically imported)
- [ ] Search results: tabs and per-type result components

### Doing

### Done

---

## Phase 7 — Moderation

### Todo
- [ ] "Report" menu item on every content card
- [ ] `<ReportModal>` with reason picker
- [ ] `app/(main)/admin/moderation/page.tsx` queue (visible only to MOD/ADMIN)
- [ ] Action UI (hide, delete, warn, suspend, ban)

### Doing

### Done

---

## Phase 8 — Polish + launch

### Todo
- [ ] PWA manifest + service worker
- [ ] Lighthouse pass: LCP < 2.5s on anime detail
- [ ] First-load JS < 200 kB gzip
- [ ] axe-core a11y in CI
- [ ] Sentry SDK
- [ ] OpenAPI codegen wired (optional `lib/api/types.gen.ts`)
- [ ] i18n scaffold (next-intl, English only at v1)
- [ ] Empty states for every list/feed
- [ ] Skeleton loaders for every async surface

### Doing

### Done

---

## Cross-cutting (continuous)

### Todo
- [ ] Sync `docs/peer/backend-architecture.md` whenever the backend updates `docs/architecture.md`
- [ ] Sync `docs/peer/backend-api-contract.md` whenever the backend updates `docs/api-contract.md`
- [ ] Keep `docs/api-client.md` endpoint inventory aligned with `endpoints.ts`
- [ ] Keep `docs/tests.md` in sync with new test plans

### Doing

### Done
