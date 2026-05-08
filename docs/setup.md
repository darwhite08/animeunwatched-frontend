# Setup

For Claude Code on the command line. Every command is copy-paste-ready.

## Prereqs

- Node 22 LTS
- A running backend at `http://localhost:4000` (see backend repo's `docs/setup.md`)
- A clone of this repo

## First time

```bash
cd animeunwatchedfrontend
npm install
cp .env.example .env.local
# .env.local should contain:
#   NEXT_PUBLIC_API_BASE=http://localhost:4000
#   NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
#   API_BASE=http://localhost:4000   (used by SSR fetches)
npm run dev
```

App is at `http://localhost:3000`.

## Daily

```bash
npm run dev
```

Make sure the backend is up first.

## After pulling main

```bash
npm install
```

If `lib/api/types.gen.ts` is in use, regenerate after the backend changes:

```bash
npm run codegen     # → npx openapi-typescript http://localhost:4000/api/v1/openapi.json -o lib/api/types.gen.ts
```

## Run tests

```bash
npm test
npm run test:coverage
npm run test:e2e
npm run test:a11y
```

## Build for production

```bash
npm run build
npm start
```

## Lint and typecheck

```bash
npm run lint
npx tsc --noEmit
```

## Sync peer docs

When the backend updates its `docs/architecture.md` or `docs/api-contract.md`:

```bash
curl -fsSL https://raw.githubusercontent.com/darwhite08/animeunwatched-backendnew/main/docs/architecture.md \
  -o docs/peer/backend-architecture.md
curl -fsSL https://raw.githubusercontent.com/darwhite08/animeunwatched-backendnew/main/docs/api-contract.md \
  -o docs/peer/backend-api-contract.md
# update the "Last synced" date in each, commit
```

## Common Claude Code prompts

> "Read docs/architecture.md, docs/api-client.md, docs/peer/backend-api-contract.md, then implement the auth module per docs/progress.md → Phase 1."

> "Add page X. Update docs/api-client.md if a new endpoint is consumed; move the ticket in docs/progress.md."

> "The backend just shipped POST /reviews/:id/like. Re-sync docs/peer/backend-api-contract.md, then add likeReview to lib/api/endpoints.ts and a useLikeReview hook with optimistic update."

> "Move 'register page' from Doing to Done in docs/progress.md and docs/tests.md, append commit hash $(git rev-parse --short HEAD)."
