# Copilot instructions for `nks-bob-frontend`

Use `AGENTS.md` at the repository root as the primary source of repo-specific guidance.

## Project-specific expectations

- This repo uses `pnpm` workspaces. Use `pnpm`, never `npm` or `yarn`.
- The root package orchestrates both the frontend and the `server/` workspace package.
- For most code changes, validate with:
  - `pnpm run lint`
  - `pnpm run build`
- There is currently no dedicated test runner configured at the repo root. Do not invent one for routine changes.

## Code and change style

- Prefer small, targeted changes that match existing patterns.
- Preserve TypeScript type safety and avoid `any` unless there is no better option.
- Reuse existing helpers and component patterns before introducing new abstractions.
- Do not add broad `try/catch` blocks or silent fallbacks that hide failures.

## Local development notes

- Standard local development uses `pnpm run dev`.
- Local development against dev-gcp/localnais uses `just setup` and `just localnais`.
- Changes affecting auth, Wonderwall, Texas, ports, env variables, or `.nais/` manifests are sensitive; ask before making those changes unless explicitly requested.

## Safety rules

- Never commit secrets, `.env` files, or fetched environment artifacts.
- Keep documentation and configuration in sync when changing developer workflows.
- If a change crosses frontend/server boundaries, update both sides consistently.
