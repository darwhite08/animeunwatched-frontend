# Frontend docs index

Repo: https://github.com/darwhite08/animeunwatched-frontend.git
Folder: `animeunwatchedfrontend`
Peer repo: https://github.com/darwhite08/animeunwatched-backendnew.git (`animeunwatchedbackend`)

There is **no shared code** between the two repos. The contract between them is the API at `/api/v1` and the WebSocket at `/socket/v1`, both versioned.

## Read order (fresh start)

1. `requirements.md` — what we're building (frontend slice)
2. `architecture.md` — how the frontend is structured
3. `api-client.md` — how we talk to the backend
4. `flows.md` — user journeys with API + DB side-by-side
5. `setup.md` — get the repo running locally
6. `conventions.md` — code conventions
7. `roadmap.md` and `progress.md` — what's done, what's next
8. `tests.md` — what's tested
9. `glossary.md` — terms

## Cross-repo visibility

Read-only mirrors of the backend's relevant docs live in `docs/peer/`:

- `peer/backend-architecture.md`
- `peer/backend-api-contract.md`

**Never edit `docs/peer/*` from this repo.** They're synced manually when the backend's docs change. The backend repo has the same arrangement in reverse, mirroring this repo's `architecture.md` and `api-client.md`.

## Working with Claude Code

Recommended starting prompt when you `cd` into this repo:

> "Read docs/README.md, docs/architecture.md, docs/peer/backend-api-contract.md, and docs/progress.md. Then tell me what to do next."

For new pages or components:

> "Add page X. Update docs/api-client.md if a new endpoint is consumed, and move the ticket in docs/progress.md and docs/tests.md."

When the backend ships a new endpoint:

> "Re-sync docs/peer/backend-api-contract.md from the backend repo, then implement the new endpoint in lib/api/endpoints.ts and a hook in hooks/."
