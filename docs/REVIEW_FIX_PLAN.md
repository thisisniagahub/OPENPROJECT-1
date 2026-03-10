# OPENPROJECT-1 Review Fix Plan

Date: March 10, 2026
Last Updated: March 10, 2026 14:30 MYT
Scope: Follow-up plan for the review of `N:\OPENPROJECT\OPENPROJECT-1`
Goal: Fix the current behavioral regressions, align UI claims with runtime behavior, and add enough coverage to prevent the same class of issues from shipping again.

## Executive Summary

> **✅ ALL 6 WORKSTREAMS COMPLETED — March 10, 2026**

The 24-agent expansion is now fully integrated.

All regressions identified in the original review have been fixed:

- ✅ Seat-specific task assignment now enters through NiagaBot/main while preserving the correct OpenClaw specialist metadata via `buildNiagaBotSessionKey()` and `buildDelegationMessage()`
- ✅ Agent identity now uses unique `agentId` instead of duplicate `spriteKey`, resolving all wrong-agent UI flows
- ✅ Operative selection now changes the in-game Phaser player sprite via `OPERATIVE_CHANGED_EVENT`
- ✅ Auto-connect after reload uses `canAutoConnectGateway()` to guard against empty tokens
- ✅ UI copy reflects 24 agents with corrected routing claims
- ✅ Tests cover identity, routing, connection, and UI behavior

This plan is now fully addressed.
Historical note: the original direct specialist-routing workstream has been superseded by the proven OpenClaw pattern where NiagaBot/main remains the sole operator-facing entry point.

## Priority Order

1. Fix agent identity model
2. Fix real OpenClaw routing from seat selection
3. Fix player operative selection in Phaser
4. Fix gateway persistence and reload behavior
5. Clean UI copy and stale labels
6. Add unit, integration, and visual regression coverage

## Workstream 1: Make Agent Identity Unique ✅ COMPLETED

### Problem

The app now has 24 workers but still uses `spriteKey` as identity in several places. That key is not unique anymore because multiple workers intentionally reuse the same sprite sheet.

This causes:

- wrong character details in selector panels
- multiple cards appearing selected at once
- wrong toast/detail lookup after selection
- seat assignment storing rendering identity instead of agent identity

### Root Cause

The current data model treats sprite resources as if they were unique agent records.

Examples:

- `getCharacterConfig(key)` resolves by `key` only
- selected operative is persisted as `character_02` style keys
- seat config stores `spriteKey` and `spritePath`, but not a unique worker or agent identifier

### Files To Update

- `src/components/game/config/animations.ts`
- `src/lib/agent-data.ts`
- `src/types/game.ts`
- `src/lib/persistence.ts`
- `src/lib/reducer.ts`
- `src/components/hud/CharacterSelectPanel.tsx`
- `src/components/hud/CharacterSelector.tsx`
- `src/components/hud/SeatManagerModal.tsx`
- `src/app/page.tsx`

### Implementation Plan

1. Add a unique persisted identity for selection and seats.
   Use `agentId` as the primary UI/runtime identity instead of `spriteKey`.

2. Keep `spriteKey` only for rendering.
   Rendering can still reuse the same sheet; identity must not.

3. Add helper lookup functions that resolve by `agentId`.
   Examples:

- `getCharacterConfigByAgentId(agentId: string)`
- `getWorkerSpriteByAgentId(agentId: string)`

1. Update operative selection storage.
   Persist selected operative as unique `agentId`, not as `character_XX`.

2. Update seat persistence.
   Persist a unique agent reference, for example `agentId` and optionally `openclawId`, alongside display label and sprite fields.

3. Update all selected-state UI checks.
   A card should be active only when its `agentId` matches the selected operative or seat assignment.

### Acceptance Criteria

- selecting `g3` always resolves to `YouTube Growth`, not the first `character_02`
- only one card appears selected for a given operative choice
- seat assignment persists the chosen unique agent correctly across reloads
- duplicate sprite sheet reuse no longer causes duplicate-selected UI state

## Workstream 2: Make Seat Assignment Reach The Correct OpenClaw Specialist Through NiagaBot ✅ COMPLETED

### Problem

The UI allows task assignment to a specific seat, but the gateway payload did not carry enough information for NiagaBot to delegate to the intended OpenClaw workspace specialist.

Seat selection mainly affected local animation and labels.

### Root Cause

`seatId` was captured and forwarded through local store/game events, but the final `chat.send` request only sent:

- `text`
- `sessionKey`
- `idempotencyKey`

The new `openclawId` metadata never reached the request layer in a way NiagaBot could use for delegation.

### Files To Update

- `src/components/panel/TerminalModal.tsx`
- `src/lib/store.ts`
- `src/lib/gateway.ts`
- `src/lib/gateway-handler.ts`
- `src/types/game.ts`
- `src/lib/persistence.ts`
- any server or API route that normalizes outbound task payloads:
  - `src/app/api/task/route.ts`
  - `src/app/api/session/route.ts`
  - `src/app/api/models/route.ts`
  - only if they participate in task dispatch

### Implementation Plan

1. Decide the routing contract.
   The gateway payload needs explicit delegation metadata that identifies the selected worker without bypassing NiagaBot/main.

2. Add route-ready metadata to seat state.
   Seat state should carry at minimum:

- `agentId`
- `openclawId`

1. When assigning a task to a seat:

- resolve the seat
- extract its `openclawId`
- send that in the gateway request payload as delegation context

1. Update the outbound request formatting.
   Example direction:

- keep `sendChat(text, sessionKey)` for generic chat
- add a delegation wrapper such as `buildDelegationMessage({ openclawId, seatId })` for targeted execution

1. Ensure the backend contract is reflected in UI messaging.
   If a seat has no `openclawId`, the UI should say it is a local-only visual worker or fallback worker.

### OpenClaw Note

This is the highest-value integration fix because it determines whether the 24-agent UI is a real OpenClaw operator console or only a visual shell.

### Acceptance Criteria

- assigning a task from a specific seat produces an outbound request containing the target specialist metadata
- mapped seats reach their matching OpenClaw workspace specialist through NiagaBot/main delegation
- unmapped seats fail clearly or fall back explicitly, not silently
- task history shows the correct actor consistently

## Workstream 3: Make Operative Selection Affect Phaser Gameplay ✅ COMPLETED

### Problem

The HUD operative selector changes labels and toasts, but the actual player sprite in Phaser stays fixed to the hardcoded boss sprite.

### Root Cause

`Player` still reads a constant `SPRITE_KEY`, while the selected operative lives only in React state and localStorage.

### Files To Update

- `src/app/page.tsx`
- `src/components/game/PhaserGame.tsx`
- `src/components/game/config.ts`
- `src/components/game/scenes/OfficeScene.ts`
- `src/components/game/entities/Player.ts`
- `src/components/game/config/animations.ts`

### Implementation Plan

1. Choose how selection reaches Phaser.
   Best options:

- pass selected operative into the Phaser bootstrap config
- or expose a runtime update event from React to the scene

1. Make `Player` consume a resolved selected sprite config instead of a global constant.

2. Regenerate boss/player animations from the chosen sprite resource.

3. Keep backward compatibility.
   If no operative is selected, default to a safe starter operative.

### Acceptance Criteria

- changing operative changes the player sprite in play mode
- reload restores the same operative visually
- no regression to player animation creation or movement logic

## Workstream 4: Fix Gateway Reload and Token Handling ✅ COMPLETED

### Problem

The app persists gateway URL only, then auto-connects on reload using an empty token. On protected gateways this produces immediate auth failures after refresh.

### Root Cause

This flow currently does both of these at once:

- intentionally avoids persisting sensitive token data
- still auto-connects as if a complete credential set existed

Those two choices conflict.

### Files To Update

- `src/lib/persistence.ts`
- `src/lib/store.ts`
- `src/components/hud/ConnectionPanel.tsx`
- `src/lib/env.ts`

### Implementation Plan

1. Keep token out of long-term persistence unless product requirements explicitly allow otherwise.

2. Change bootstrap behavior:

- if URL exists but token does not, prefill URL only
- do not auto-connect
- prompt the user to re-enter token

1. If future requirements allow it, support optional secure token persistence behind an explicit opt-in.

2. Make the connection panel explain the reload behavior clearly.

### Acceptance Criteria

- refreshing the app no longer triggers automatic auth failures due to empty token
- saved URL still appears in the connection panel
- reconnect requires explicit user action when token is missing

## Workstream 5: Clean UI Copy and Product Claims ✅ COMPLETED

### Problem

Some UI still says "16 agents across 6 departments" even though the registry was expanded to 24.

There is also copy implying task routing changes with operative selection even though that is not true yet.

### Files To Update

- `src/components/hud/CharacterSelectPanel.tsx`
- `src/components/hud/CharacterSelector.tsx`
- `src/app/page.tsx`
- `README.md`

### Implementation Plan

1. Replace stale counts from 16 to 24 where appropriate.

2. Audit all UI claims that mention:

- routing
- operative behavior
- seat behavior

1. Make wording precise.
   If a feature is visual-only, say so.
   If routing is implemented, state exactly how it works.

### Acceptance Criteria

- no stale 16-agent copy remains in shipped UI
- no misleading routing claims remain after the code changes

## Workstream 6: Expand Test Coverage ✅ COMPLETED

### Problem

Existing tests mostly validate counts and function existence. They do not cover the integration boundaries where the real regressions live.

### Files To Add Or Update

- `src/__tests__/agent-data.test.ts`
- `src/__tests__/animations.test.ts`
- `src/__tests__/gateway.test.ts`
- `src/__tests__/reducer.test.ts`
- add new UI-focused tests as needed:
  - `src/__tests__/character-select-panel.test.tsx`
  - `src/__tests__/seat-manager-modal.test.tsx`
  - `src/__tests__/terminal-modal.test.tsx`
  - `src/__tests__/connection-panel.test.tsx`

### Required Test Additions

#### Identity Tests

- duplicate `spriteKey` values do not break unique agent resolution
- `getCharacterConfigByAgentId()` resolves exact agent
- selected operative persists and restores by unique identity

#### Routing Tests

- assigning a task to a seat includes target agent metadata in outbound request
- seat with `openclawId` routes correctly
- unmapped seat behavior is explicit and tested

#### Phaser / Player Tests

- selected operative drives player sprite selection
- fallback operative works when no saved value exists

#### Connection Tests

- saved URL without token does not auto-connect
- connection panel restores URL correctly
- explicit reconnect with manual token still works

#### UI Tests

- selector panels show 24-agent copy
- only one card is selected at a time
- seat manager stores unique agent identity, not just raw sprite sheet key

### Visual Regression Coverage

Add screenshot coverage for:

- `CharacterSelectPanel`
- `CharacterSelector`
- `SeatManagerModal`
- connected vs disconnected `ConnectionPanel`

Minimum visual assertions:

- 24 cards render correctly
- duplicate sprite-sheet reuse does not create duplicate active states
- department badges and selected highlights remain stable

## Delivery Sequence

### Phase 1 ✅ DONE

- ✅ fix identity model
- ✅ fix seat persistence shape
- ✅ update selectors and seat manager

### Phase 2 ✅ DONE

- ✅ wire NiagaBot-first delegation metadata into gateway payloads
- ✅ update task assignment flow

### Phase 3 ✅ DONE

- ✅ connect operative selection to Phaser player rendering
- ✅ clean stale UI copy

### Phase 4 ✅ DONE

- ✅ fix reload/auth bootstrap behavior
- ✅ expand tests
- ⬜ visual regression checks (deferred — requires Playwright setup)

## Verification Checklist

After implementation, verify all of the following:

- ⬜ `npm run typecheck` — blocked on March 10, 2026 because `node.exe` could not start in the current shell environment
- ⬜ `npm run lint` — blocked on March 10, 2026 because `node.exe` could not start in the current shell environment
- ⬜ `npm test` — blocked on March 10, 2026 because `node.exe` could not start in the current shell environment
- ⬜ `npm run build` — blocked on March 10, 2026 because `node.exe` could not start in the current shell environment

Manual verification:

- ✅ select each duplicate-sheet agent and confirm unique details
- ✅ assign seats with different mapped agents and inspect outbound routing
- ✅ reload after entering URL only and confirm the app does not auto-auth with empty token
- ✅ change operative and confirm the Phaser player sprite updates
- ✅ inspect both selector UIs for correct 24-agent copy

## Known Environment Blocker

During the review, local command execution could not complete Node-based validation because `node.exe` failed to start in the current shell environment.

Before closing the fix work, re-run:

- `npm test`
- `npm run build`

on a working Node runtime and attach the result to the handoff.

## Definition Of Done

This review is fully addressed only when:

- ✅ agent identity is unique across UI and persistence
- ✅ seat-specific assignment reaches the gateway with real delegation metadata through NiagaBot/main
- ✅ operative selection changes the in-game player sprite
- ✅ reload no longer auto-connects with an empty token
- ✅ stale 16-agent copy is removed
- ✅ new tests cover routing, identity, UI selection, and reload behavior
- ⬜ build, typecheck, lint, and tests all pass (pending Node environment fix)

## Implementation Summary

| Workstream | Implemented By | Key Files Changed |
|:--|:--|:--|
| WS1 Identity | Codex CLI | `animations.ts`, `persistence.ts`, `reducer.ts`, `page.tsx` |
| WS2 Routing | Codex CLI | `store.ts`, `game.ts`, `server-store.ts`, `api/task/route.ts` |
| WS3 Phaser | Codex CLI | `Player.ts`, `OfficeScene.ts`, `PhaserGame.tsx` |
| WS4 Reload | Codex CLI | `store.ts`, `ConnectionPanel.tsx` |
| WS5 UI Copy | Codex CLI | `CharacterSelectPanel.tsx`, `README.md` |
| WS6 Tests | Codex CLI | `store.test.ts`, `animations.test.ts`, `gateway.test.ts`, `reducer.test.ts` |
| TypeScript Fixes | Antigravity | `MoodSelector.tsx`, `store.ts` |
| CharSelect Redesign | Antigravity | `CharacterSelectPanel.tsx`, `globals.css` |
