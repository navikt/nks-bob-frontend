# AGENTS.md — nks-bob-frontend

## Repository overview

`nks-bob-frontend` is a React + TypeScript + Vite application with a small Node/Express server in the `server/` workspace package.

The application is used by NKS to assist veiledere with AI-assisted text generation and related workflows.

## Tech stack

- Frontend: React 19, TypeScript, Vite, React Router, SWR, Zustand
- Design system: `@navikt/ds-react`, `@navikt/aksel-icons`, Tailwind CSS
- Server: Node.js, Express, TypeScript, SWC, `tsx`
- Tooling: pnpm workspaces, ESLint, Prettier, Just, Docker Compose
- Deployment: NAIS (`.nais/dev-gcp.yaml`, `.nais/prod-gcp.yaml`)

## Repository structure

- `src/`: frontend source code
- `server/src/`: backend/server source code
- `public/`: static assets
- `.nais/`: deployment manifests

## Install and run

```bash
pnpm install
pnpm run build
pnpm run dev
```

Useful commands:

```bash
pnpm run lint              # Lint the whole repo
pnpm run build             # Build frontend and server
pnpm run dev               # Run frontend + server locally
pnpm run preview           # Preview the frontend build
just setup                 # Login and fetch env for local dev against dev-gcp
just localnais             # Start local services for localnais/dev-gcp flow
docker-compose up          # Start local Wonderwall/Texas/Redis services directly
```

## Validation

There is currently no dedicated automated test command configured in this repository.

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
- Follow existing naming and folder conventions in `src/` and `server/src/`.
- Use `pnpm`, not `npm` or `yarn`.
- Do not add broad error swallowing; surface errors explicitly.

## Change boundaries

### Always

- Update both frontend and server wiring when a feature crosses that boundary.
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

- Treat this as a workspace repo: root scripts orchestrate both frontend and `server/`.
- `README.md` is the source of truth for developer onboarding and localnais setup.
- If a requested change needs tests, note that the repo currently lacks a configured test runner and validate with lint/build unless the task adds test infrastructure explicitly.
