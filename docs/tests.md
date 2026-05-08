# Test catalog

## Frameworks

- Unit + component: Vitest + React Testing Library
- Hooks: `@testing-library/react` `renderHook`
- Mocks: msw (intercept network, both browser and node)
- E2E: Playwright (Chromium, Firefox, WebKit)
- A11y: axe-core via `@axe-core/playwright`

## Coverage targets

- `lib/api/client.ts`: 95% (refresh interceptor, error mapping, single-flight)
- `lib/api/endpoints.ts`: 80% (smoke per endpoint)
- Hooks (`hooks/*`): 80% on optimistic mutations
- Components: 70% line — focus on interactive ones (composers, widgets, forms)
- Utility (`lib/utils/*`): 95%

## Run

```bash
npm test                 # unit + component
npm test -- --watch
npm run test:coverage
npm run test:e2e         # Playwright
npm run test:e2e -- --ui # Playwright UI mode
npm run test:a11y        # axe-core suite
```

## Per-module test plan (Kanban)

### lib/api/client

#### Todo
- [ ] success path: returns parsed JSON
- [ ] 204 returns undefined
- [ ] non-2xx throws ApiError with code + message
- [ ] 401 → triggers refresh → retries once → succeeds
- [ ] 401 → refresh fails → clears auth → redirects to /login
- [ ] single-flight: 5 concurrent 401s issue exactly 1 refresh
- [ ] AccessToken from store attached as Bearer

#### Doing

#### Done

### lib/auth/store

#### Todo
- [ ] setAccess updates state
- [ ] clear resets to null
- [ ] persisted nowhere (no localStorage)

#### Doing

#### Done

### lib/socket

#### Todo
- [ ] connects with token
- [ ] joins user room (mocked via msw socket)
- [ ] reconnects on disconnect
- [ ] re-emits new token after refresh

#### Doing

#### Done

### components/auth

#### Todo
- [ ] LoginPage: invalid email shows field error
- [ ] LoginPage: wrong password shows toast
- [ ] LoginPage: success calls setAccess + navigates
- [ ] RegisterPage: weak password shows field error
- [ ] RegisterPage: duplicate email surfaces CONFLICT toast

#### Doing

#### Done

### components/anime

#### Todo
- [ ] AnimeCard: renders image, title, score
- [ ] AnimeHero: shows synopsis, genres, status badge
- [ ] ListStatusWidget: optimistic update on status change
- [ ] ListStatusWidget: rollback on error
- [ ] SeasonFilter: changes URL params
- [ ] AnimeCard: keyboard accessible

#### Doing

#### Done

### components/post

#### Todo
- [ ] PostComposer: char counter
- [ ] PostComposer: mention autocomplete fires after `@`
- [ ] PostComposer: empty content disables submit
- [ ] PostCard: like button toggles optimistically
- [ ] PostCard: rollback on error
- [ ] PostFeed: infinite scroll fires fetch when sentinel intersects

#### Doing

#### Done

### components/thread

#### Todo
- [ ] ThreadComposer: markdown preview tab works
- [ ] ReplyTree: collapses subtree on click
- [ ] ReplyTree: spoiler tag click reveals
- [ ] ReplyTree: deep nesting (10+) doesn't crash

#### Doing

#### Done

### components/notification

#### Todo
- [ ] NotificationBell: badge updates on socket event
- [ ] NotificationBell: badge clears after markAllRead
- [ ] NotificationList: paginates
- [ ] NotificationList: click navigates and marks read

#### Doing

#### Done

### hooks

#### Todo
- [ ] useAnime: caches by id, staleTime works
- [ ] useUpsertListEntry: optimistic + rollback
- [ ] useLikePost: optimistic toggle
- [ ] useFollow: optimistic toggle
- [ ] useFeed: cursor pagination merges correctly

#### Doing

#### Done

## E2E suites (Playwright)

#### Todo
- [ ] `tests/e2e/register-and-track.spec.ts`: register → browse season → track an anime → see it on profile
- [ ] `tests/e2e/post-and-notify.spec.ts`: two browser contexts; A posts mentioning B; B sees toast + bell badge
- [ ] `tests/e2e/club-thread.spec.ts`: create club → post thread → reply
- [ ] `tests/e2e/refresh-rotation.spec.ts`: simulate access expiry; assert silent refresh and page stays logged in
- [ ] `tests/e2e/search.spec.ts`: type in box, dropdown shows; press enter, search page loads with tabs
- [ ] `tests/e2e/a11y-anime-detail.spec.ts`: axe-core, no critical violations

#### Doing

#### Done

## Visual regression (optional, post-v1)

Storybook + Chromatic on:
- AnimeCard
- PostCard
- ReplyTree (3 depths)
- ListStatusWidget (every status)
- NotificationBell (with and without badge)
