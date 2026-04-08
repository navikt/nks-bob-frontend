# AGENTS.md — nks-bob-frontend

## Repository overview

`nks-bob-frontend` is a Next.js (App Router) application providing an AI-assisted text generation interface for NKS veiledere.

## Tech stack

- Framework: Next.js 16 (App Router, React Server Components)
- Frontend: React 19, TypeScript, SWR, Zustand
- Design system: `@navikt/ds-react`, `@navikt/aksel-icons`, Tailwind CSS
- Auth: `@navikt/oasis` (Wonderwall/Texas token exchange)
- Observability: `prom-client`, `winston`
- Tooling: pnpm, ESLint (eslint-config-next), Prettier, Just, Docker Compose
- Deployment: NAIS (`.nais/dev-gcp.yaml`, `.nais/prod-gcp.yaml`)

## Repository structure

- `app/`: Next.js App Router pages, layouts, and API route handlers
- `components/`: React components (mostly `"use client"`)
- `lib/`: API hooks, auth utilities, Zustand stores, shared utilities
- `types/`: TypeScript type definitions
- `public/`: Static assets
- `.nais/`: Deployment manifests

## Install and run

```bash
pnpm install
pnpm run build
pnpm run dev
```

Useful commands:

```bash
pnpm run lint              # Lint the whole repo
pnpm run build             # Build Next.js app (standalone output)
pnpm run dev               # Run Next.js dev server on port 3030
pnpm run start             # Start production server on port 3030
just setup                 # Login and fetch env for local dev against dev-gcp
just localnais             # Start local services for localnais/dev-gcp flow
docker-compose up          # Start local Wonderwall/Texas/Redis services directly
```

## Validation

Before finishing changes, run:

```bash
pnpm run lint
pnpm run build
```

For changes affecting localnais or auth/local integration, also verify the relevant local flow with `just localnais`.

## Code standards

- Prefer existing patterns and helpers over introducing new abstractions.
- Keep changes small and targeted.
- Preserve TypeScript type safety; avoid `any` unless there is no better option.
- Follow existing naming and folder conventions.
- Use `pnpm`, not `npm` or `yarn`.
- Do not add broad error swallowing; surface errors explicitly.
- Add `"use client"` directive to components using hooks, state, or browser APIs.
- Keep API route handlers (`app/**/route.ts`) as server-only code.

## Change boundaries

### Always

- Update both frontend and API route handler wiring when a feature crosses that boundary.
- Keep NAIS config, runtime assumptions, and local development scripts in sync.
- Verify builds still pass after changing shared interfaces or env-dependent logic.

### Ask first

- Changing authentication or Wonderwall/Texas-related local setup
- Modifying NAIS manifests or production deployment behavior
- Adding new dependencies or introducing new tooling
- Changing environment variable names or local development ports

### Never

- Commit secrets, `.env` files, or fetched login/environment artifacts
- Replace `pnpm` workflow with another package manager
- Remove lint/build verification for completed code changes

## Notes for agents

- This is a Next.js App Router application with `output: "standalone"` for NAIS deployment.
- `README.md` is the source of truth for developer onboarding and localnais setup.
- The `server/` directory is the legacy Express server (kept for reference but not used).
- If a requested change needs tests, note that the repo currently lacks a configured test runner.
