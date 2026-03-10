# Codex Fix Prompt — Agent Town Release Cleanup

Date: March 10, 2026
Scope: Fix all release blockers and should-fix items identified in `docs/REVIEW_REPORT.md`
Project Root: `N:\OPENPROJECT\OPENPROJECT-1`

---

## Context

Agent Town is a Next.js 16 + Phaser 3 spatial operator console for OpenClaw agent fleets. A comprehensive code review identified 8 issues — 4 release blockers and 4 should-fix items. All 6 prior workstreams (identity, routing, operative, reload, UI copy, tests) are already complete.

Architecture guardrail for every fix in this prompt:

- Preserve `agent:main:main` as the sole user-facing gateway entry session.
- Treat seat `openclawId` values as delegation hints for NiagaBot, not as direct operator-to-specialist routing keys.
- Do not reintroduce direct specialist session targeting from the browser.

Key files you should read first before making changes:

- `docs/REVIEW_REPORT.md` — full review with issue details
- `docs/PRD.md` — product requirements (especially Release Readiness Gates section at the bottom)
- `docs/ARCHITECTURE.md` — system architecture
- `src/types/game.ts` — domain types
- `src/lib/gateway-types.ts` — gateway type contracts

---

## Task 1: Remove `ignoreBuildErrors` from `next.config.ts`

**File**: `next.config.ts`
**Issue**: `ignoreBuildErrors: true` silently skips TypeScript errors during production builds.
**Action**:

1. Remove the `typescript: { ignoreBuildErrors: true }` block from `next.config.ts`
2. Run `npx next build` to surface any TypeScript errors
3. Fix every TypeScript error that surfaces — do NOT re-enable `ignoreBuildErrors`
4. Common error sources to watch for:
   - Phaser types in `src/components/game/` (scenes, entities, config)
   - Gateway handler payload types in `src/lib/gateway-handler.ts`
   - Event handler types in HUD components under `src/components/hud/`
   - Dynamic imports in `src/app/page.tsx`

**Acceptance**: `npx next build` completes with zero TypeScript errors and `ignoreBuildErrors` is not present in `next.config.ts`.

---

## Task 2: Enable `noImplicitAny` in `tsconfig.json`

**File**: `tsconfig.json`
**Issue**: `noImplicitAny: false` allows untyped values everywhere, weakening type safety.
**Action**:

1. Change `"noImplicitAny": false` to `"noImplicitAny": true` in `tsconfig.json`
2. Run `npx tsc --noEmit` to find all implicit `any` errors
3. Fix every error by adding correct types — do NOT use `any` as a fix unless absolutely necessary (e.g. third-party callback with no type). If you must use `any`, add a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment explaining why.
4. Common areas that will need type annotations:
   - Event handlers (`event` params in HUD components)
   - Phaser callback parameters
   - Gateway message payloads
   - localStorage parsed values
   - Dynamic import results
   - Reducer action payloads

**Acceptance**: `npx tsc --noEmit` passes with zero errors and `noImplicitAny` is `true`.

---

## Task 3: Align Prisma Schema with Runtime Tables

**Files**: `prisma/schema.prisma`, `src/lib/server-store.ts`
**Issue**: `schema.prisma` has placeholder `User`/`Post` models but `server-store.ts` creates `openproject_sessions` and `openproject_tasks` tables via raw SQL. The schema and runtime are completely disconnected.
**Action**:

1. Read `src/lib/server-store.ts` to understand the actual table structure (look at the `CREATE TABLE` statements)
2. Replace the `User` and `Post` models in `prisma/schema.prisma` with models that match the actual runtime tables:
   - `OpenprojectSession` model matching the `openproject_sessions` table
   - `OpenprojectTask` model matching the `openproject_tasks` table
3. Use `@@map("openproject_sessions")` and `@@map("openproject_tasks")` to match existing table names
4. Update `server-store.ts` to use Prisma Client queries instead of raw SQL (`$executeRawUnsafe`, `$queryRawUnsafe`) where possible. Keep raw SQL only if Prisma Client cannot express the query.
5. Run `npx prisma generate` to regenerate the Prisma client
6. Run `npx prisma db push` to verify the schema matches (use `--accept-data-loss` only if the existing data is test data)

**Acceptance**: `prisma/schema.prisma` models match runtime tables, `server-store.ts` uses Prisma Client queries where possible, and `npx prisma generate` succeeds.

---

## Task 4: Deduplicate Event and Model Contracts

**Files**:

- `src/lib/events.ts` (line ~4) — has `GameEventMap`
- `src/types/game.ts` (line ~275) — has another `GameEventMap`
- `src/lib/gateway-handler.ts` (line ~15) — has `ModelChoice` interface
- `src/lib/gateway-types.ts` (line ~119) — has another `ModelChoice` interface

**Issue**: Duplicate type definitions will drift over time.
**Action**:

1. **GameEventMap**: Keep the canonical version in `src/types/game.ts` (since that's the domain types file). Update `src/lib/events.ts` to import and use the type from `src/types/game.ts` instead of redefining it. If the signatures differ, merge them into a single correct definition.
2. **ModelChoice**: Keep the canonical version in `src/lib/gateway-types.ts` (since that's where gateway contracts live). Update `src/lib/gateway-handler.ts` to import `ModelChoice` from `gateway-types.ts` instead of redefining it locally.
3. Search the entire `src/` directory for any other duplicated interfaces or types and consolidate them.
4. Run `npx tsc --noEmit` after changes to verify no type errors.

**Acceptance**: Each type/interface is defined in exactly one file. No duplicate definitions remain. TypeScript compiles cleanly.

---

## Task 5: Remove Unused Dependencies

**File**: `package.json`
**Issue**: `zustand` and `@tanstack/react-query` are installed but never imported anywhere.
**Action**:

1. Search the entire `src/` directory to confirm these packages are truly unused:
   - `grep -r "from ['\"]zustand" src/` — should return nothing
   - `grep -r "from ['\"]@tanstack" src/` — should return nothing
2. If confirmed unused, remove them: `npm uninstall zustand @tanstack/react-query @tanstack/react-query-devtools`
3. Also check for any other unused dependencies while you're at it (e.g. packages in `dependencies` that are never imported)
4. Run `npm install` to clean the lockfile
5. Run `npx next build` to verify nothing breaks

**Acceptance**: `package.json` contains no unused runtime dependencies. Build passes.

---

## Task 6: Implement or Hide Empty Mood Themes

**File**: `src/lib/theme-registry.ts`
**Issue**: 5 of 7 mood themes (`industrial`, `synthwave`, `bauhaus`, `oracle`, `brutalist`) are empty `{}` objects, so the MoodSelector shows options that do nothing.
**Action** (choose ONE approach):

**Option A — Implement the themes** (preferred):

1. Read the existing `standard` and `cyber-pixel` mood themes in `theme-registry.ts` to understand the token structure
2. Implement all 5 empty themes with appropriate CSS variable overrides that create visually distinct moods:
   - `industrial`: Dark grays, steel blues, rough textures, muted palette
   - `synthwave`: Neon pink/purple/cyan, dark backgrounds, retro-futuristic
   - `bauhaus`: Primary colors (red/blue/yellow) on white/black, geometric feel
   - `oracle`: Deep purples, gold accents, mystical/ethereal atmosphere
   - `brutalist`: Raw concrete tones, stark contrast, minimal decoration
3. Each theme should override at minimum: `--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--pixel-bg`, `--pixel-border`, `--pixel-yellow`, `--pixel-green`

**Option B — Hide until implemented**:

1. Filter the empty themes out of the exported mood list so MoodSelector only shows `standard` and `cyber-pixel`
2. Keep the empty objects in the registry (commented) for future implementation
3. Add a TODO comment explaining the placeholder themes

**Acceptance**: MoodSelector only shows themes that actually change the visual appearance. No broken/no-op theme options visible to the user.

---

## Task 7: Add Phaser Error Boundary

**Files**: New file `src/components/game/GameErrorBoundary.tsx`, modify `src/app/page.tsx`
**Issue**: If Phaser crashes, the user sees a blank screen with no recovery path.
**Action**:

1. Create `src/components/game/GameErrorBoundary.tsx` — a React error boundary that:
   - Catches errors from the Phaser game container
   - Shows a pixel-art styled fallback UI with the error message
   - Offers a "Restart Game" button that remounts the PhaserGame component
   - Uses the existing pixel-panel CSS classes from `globals.css` for consistent styling
2. Wrap the dynamic PhaserGame import in `src/app/page.tsx` with this error boundary
3. The fallback should look consistent with the existing pixel-art theme

**Acceptance**: Phaser crashes display a styled recovery UI instead of a blank screen. The "Restart" button successfully remounts the game.

---

## Task 8: Run Full Verification Suite

After completing Tasks 1-7, run the full verification:

```bash
npx tsc --noEmit          # TypeScript typecheck
npx next build            # Production build
npx vitest run            # Unit tests
npx next lint             # Linting (if configured)
```

**Action**:

1. Fix any errors surfaced by these commands
2. Do NOT re-enable `ignoreBuildErrors` or disable `noImplicitAny` to pass
3. If tests fail, fix the test or the underlying code — do not delete tests
4. Update `docs/REVIEW_FIX_PLAN.md` verification checklist to mark items as completed with the actual results

**Acceptance**: All 4 commands pass. The verification checklist in `REVIEW_FIX_PLAN.md` is updated with results.

---

## Execution Order

Execute tasks in this order due to dependencies:

1. **Task 2** first (noImplicitAny) — this surfaces type gaps needed for Task 1
2. **Task 1** next (ignoreBuildErrors) — relies on types being clean
3. **Task 4** (deduplicate types) — clean up before Prisma work
4. **Task 3** (Prisma schema) — may surface new type changes
5. **Task 5** (remove deps) — safe cleanup
6. **Task 6** (mood themes) — independent UI work
7. **Task 7** (error boundary) — independent component work
8. **Task 8** (verification) — final validation of everything

---

## Rules

- Do NOT use `// @ts-ignore` or `// @ts-expect-error` to suppress errors — fix the actual types
- Do NOT re-enable `ignoreBuildErrors` in `next.config.ts`
- Do NOT set `noImplicitAny` back to `false`
- Do NOT delete existing tests — fix them if they break
- Do NOT change the behavior of existing features — this is a cleanup, not a feature change
- Do NOT reintroduce direct operator-to-specialist routing; all operator-originated work must continue to enter through NiagaBot/main
- Preserve all existing functionality — game, HUD, gateway, routing, persistence
- If a fix requires changing a public API or interface, update all consumers
- After all tasks, update `worklog.md` with a new entry summarizing what was fixed
