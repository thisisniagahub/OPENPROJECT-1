# Product Requirements Document

**Version**: 2.0
**Last Updated**: March 10, 2026

## Product Overview

Agent Town is a real-time spatial operator console for teams running OpenClaw agent fleets. It presents live gateway activity as a pixel-art office where AI agents occupy seats, receive tasks, stream progress, and return results through a game layer and HUD panels.

The product combines operational visibility and lightweight control. Teams can connect to an OpenClaw gateway, see which agents are active, inspect task history, assign work to specific seats, let NiagaBot coordinate specialist delegation, monitor model usage, and customize how agents appear in the office.

## Product Positioning

Agent Town is intended to sit on top of OpenClaw, not beside it as a competing runtime:

- OpenClaw remains the system of record for agent execution, session semantics, tools, models, and routing.
- Agent Town acts as the spatial control surface for operators who want visibility and lightweight dispatch.
- The browser app may keep app-local history and seat metadata, but it does not redefine workspace truth.
- The product complements OpenClaw Control UI rather than replacing gateway onboarding, channel pairing, or privileged administration.

## System Boundaries

Agent Town owns:

- office visualization and in-world worker behavior
- operator task submission and monitoring UX
- seat discovery, labels, and seat-to-agent mapping
- app-local task/session persistence for operator workflows

OpenClaw owns:

- workspace code and agent behavior
- skill, tool, and provider configuration
- gateway auth, routing, and long-lived session state
- channel pairing, remote access posture, and node/device behavior

## Target Users

- AI teams operating multi-agent OpenClaw workspaces
- Operators who need real-time visibility into agent activity
- Builders who want a visual control surface for agent fleets
- Growth, commerce, research, and operations teams coordinating specialist agents

## Core User Stories

- As an operator, I want to connect Agent Town to an OpenClaw gateway so that I can observe live workspace activity.
- As a team lead, I want to visualize agents as workers in a virtual office so that I can see which specialists are available or busy.
- As a coordinator, I want to assign tasks to a specific seated agent and have NiagaBot route or delegate that task to the correct OpenClaw specialist.
- As an operator, I want to review task history and outcomes so that I can audit progress and diagnose failures.
- As a user, I want to chat with agents through the visual workspace so that I can use Agent Town as a lightweight mission-control console.
- As an admin, I want to manage seats, labels, and agent assignments so that the office layout reflects my real agent fleet.
- As an operator, I want to change models and inspect session metrics so that I can tune quality, speed, and cost.
- As a player, I want my chosen operative to reflect as the in-game player sprite so that the visualization feels immersive.

## Functional Requirements

### Gateway Connection

- Users can connect to an OpenClaw gateway through a WebSocket URL and runtime token.
- The app must show connection states including offline, connecting, authenticating, online, unreachable, auth failed, and rate limited.
- The client must reconnect automatically when the gateway disconnects unexpectedly.
- On page reload, the app must restore a saved gateway URL and only auto-reconnect when the saved config does not require a fresh runtime token. If a gateway requires operator re-auth, the UI must prompt re-entry instead of silently retrying with an empty token.

### Gateway Security and Access Model

- Runtime gateway credentials must be entered by the operator at connection time when required.
- Browser-visible configuration must not embed privileged long-lived gateway secrets in public env vars.
- Remote deployments should assume private access patterns such as SSH tunneling, Tailscale, or secured `wss://` transport.
- Product docs and onboarding must discourage exposing insecure Control UI or raw gateway ports publicly by default.

### OpenClaw System of Record

- `openclawId` is the canonical bridge from a visual seat to a deployed OpenClaw workspace agent.
- Agent Town may render visual-only workers, but only mapped seats may claim real execution routing.
- Operator-originated work must enter through NiagaBot/main while carrying mapped OpenClaw identities as delegation hints rather than bypassing the user-facing coordinator.
- Model, tool, and workspace configuration should remain managed in OpenClaw, not recreated inside the browser app.

### Agent Identity Model

The project uses a dual-layer agent registry:

1. **`agent-data.ts`** — Canonical business definitions (24 agents, department, skills, revenue, `openclawId`).
2. **`animations.ts`** — Visual sprite registry (sprite sheet, label, color, personality, catchphrases, `agentId`, `openclawId`).

Each agent is identified by a **unique `agentId`** (e.g. `"a1"`, `"g3"`), not by `spriteKey`. Multiple agents may share the same sprite sheet (`spriteKey`), so all selection, persistence, and routing logic must resolve by `agentId`.

Key implementation:

- `getCharacterConfigByAgentId(agentId)` — primary lookup
- `getCharacterConfig(id)` — accepts both `agentId` (primary) and legacy `spriteKey` (fallback)
- Operative selection persists and restores by `agentId`
- Seat configs persist `agentId` and `openclawId` alongside `spriteKey` for rendering

### Agent Visualization

- The office scene must render up to 24 agents across 6 departments.
- Agents must appear as seated pixel-art workers with labels, roles, and activity status.
- Worker motion, bubbles, and seat occupancy must reflect live task events when available.
- Only one agent card may appear selected at a time, resolved by unique `agentId`.

### HUD Panels

- The HUD must expose connection controls, task views, agent status, worker availability, model selection, settings, onboarding, and keyboard help.
- Users must be able to inspect task history and streaming responses without leaving the main screen.
- HUD panels (Tasks, Chat) render on the right side of the screen as flyouts.
- Engine Status and Mood Selector are centered at the bottom.

### Seat Management

- Users can manage seat assignments, labels, and worker sprite mappings.
- Seat discovery from the office map must sync with persisted seat configuration.
- Persisted seat config includes `agentId` and `openclawId` for routing, alongside visual fields (`spriteKey`, `spritePath`, `label`).
- Tasks can target a specific seat or be routed to the next available worker.

### Task Routing

- When a task is assigned to a specific seat, the outbound gateway request must include the seat's `openclawId`, `agentId`, and seat metadata as NiagaBot delegation hints.
- Seat-targeted routing should enter the active operator session or `agent:main:main` fallback instead of bypassing NiagaBot with direct specialist session keys.
- Seats without an `openclawId` fall back to generic NiagaBot handling.
- Unmapped seat behavior must be explicit — the UI should indicate when a seat is visual-only vs. connected to a real workspace agent.
- Task history must record the `agentId`, `openclawId`, and `actorName` for every task.

### Task Tracking

- Users can submit tasks through the terminal interaction flow.
- Task lifecycle states must include submitted, queued, returning, running, completed, failed, and stopped.
- Task history must preserve prior sessions and allow users to inspect results.

### Operator Persistence

- Agent Town must maintain durable app-local task/session history for operator-facing workflows.
- Local task/session APIs must require server-side authorization separate from the gateway runtime token.
- Persisted records should capture operator-relevant summaries and routing metadata without pretending to replace OpenClaw's own execution history.
- Persistence should work across app restarts in a single deployment environment.

### Model Selection

- Users can fetch available models from the connected gateway.
- Users can switch models from the HUD while connected.
- The current session metrics should reflect the latest selected model and token usage when provided by the gateway.

### Operative Selection

- Users can choose a preferred agent as their operative from the character selector.
- The selected operative must change the in-game player sprite in Phaser (not just the HUD label).
- Operative change emits a `OPERATIVE_CHANGED_EVENT` that the Phaser scene listens to for runtime sprite swapping.
- If no operative is selected, the game defaults to a safe starter operative (`DEFAULT_OPERATIVE_AGENT_ID`).
- Operative selection persists and restores by `agentId` across reloads.

### Character Customization

- Worker seats should retain sprite, agent identity, and label configuration between sessions.
- The character select panel must display all 24 agents with department badges, skill breakdowns, and catchphrases.

## Non-Functional Requirements

### Performance

- The main play view should remain responsive during message streaming and frequent event updates.
- Task and chat persistence should stay bounded to avoid unbounded local storage growth (max 200 tasks, 400 chat messages).
- Worker and HUD updates should avoid blocking the Phaser render loop.

### Accessibility

- Core UI controls should remain keyboard reachable.
- Text contrast should be readable on the default dark workspace theme.
- Modal and overlay interactions should expose clear focus targets and close actions.

### Browser Support

- Primary support target: modern Chromium browsers on desktop.
- Secondary support target: current Firefox and Safari desktop releases.
- The app should degrade gracefully when browser audio or WebSocket features are limited.

### Security

- Server-side task/session APIs must require a dedicated `OPENPROJECT_API_TOKEN`.
- Timing-safe token comparison should be used for local API auth checks.
- The app must treat remote gateway access as a security-sensitive deployment concern, not a convenience default.
- Browser clients should operate with least privilege and avoid receiving admin-only gateway capabilities by default.

### Hydration Safety

- All client-side-only logic (localStorage, Zustand, Phaser) must be guarded with `isMounted` checks to prevent React SSR hydration mismatches.
- `GameHud` and other client-heavy components render only after `mounted` state is true.

## Tech Stack

- Next.js 16 (App Router)
- Phaser 3 (Game engine)
- TypeScript 5.9
- Tailwind CSS 4
- React context + reducer store architecture (Zustand 5 as dependency)
- Prisma 6 + SQLite-backed app-local persistence
- Vitest 4 (test runner)

## Agent Ecosystem

Agent Town tracks a 24-agent roster across 6 departments:

| Department | Count | OpenClaw-Mapped |
|-----------|-------|----------------|
| Intel | 3 | 1 |
| Content | 9 | 8 |
| Commerce | 6 | 5 |
| Ops | 3 | 2 |
| Research | 1 | 1 |
| Labs | 2 | 1 |
| **Total** | **24** | **18** |

Each visual agent can map to a deployed OpenClaw workspace identity through `openclawId`. That allows the frontend roster to preserve stable in-world names while giving NiagaBot enough context to delegate to the correct backend agent.

6 agents operate as visual-only workers (no `openclawId`): Competitor Spy, Audience Profiler, Email Copywriter, Fallback Guardian, Budget Tracker, and Prompt Engineer.

## External Integrations

### social-growth-suite

- Provides 17 OpenClaw workspace agents deployed separately behind the gateway.
- Supplies most mapped specialists used by Agent Town.

### brand-research-agent

- Provides 1 standalone OpenClaw workspace agent.
- Maps to the visual `Brand Research Agent` via `openclawId: "brand-research-agent"`.

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| 24-agent registry | ✅ Done | Both `agent-data.ts` and `animations.ts` |
| Unique `agentId` identity | ✅ Done | WS1 — `agentId` primary key, legacy `spriteKey` fallback |
| NiagaBot/main delegation routing | ✅ Done | WS2 — `buildNiagaBotSessionKey()` + `buildDelegationMessage()` preserve specialist metadata without direct operator-to-specialist routing |
| Operative → Phaser sprite | ✅ Done | WS3 — `Player.ts` dynamic key, `OPERATIVE_CHANGED_EVENT` bridge |
| Gateway reload token guard | ✅ Done | WS4 — saved config reconnects only when no fresh runtime token is required |
| UI copy cleanup (24 agents) | ✅ Done | WS5 — counts and routing claims corrected |
| Identity/routing/UI tests | ✅ Done | WS6 — new tests in store, animations, gateway, reducer |
| Gateway WebSocket client | ✅ Done | Reconnect, heartbeat, handshake |
| HUD panels | ✅ Done | Connection, Tasks, Chat, Settings |
| Character Select Panel | ✅ Done | Pixel-art panel with dept filters, search |
| Seat Discovery + Merge | ✅ Done | Map-driven + persisted configs with `agentId`/`openclawId` |
| Task Lifecycle | ✅ Done | Full state machine |
| Model Selection | ✅ Done | Fetch + switch from HUD |
| Session Management | ✅ Done | Multi-session with switching |
| Local Task/Session API Auth | ✅ Done | Protected by `OPENPROJECT_API_TOKEN` |
| App-local Durable Persistence | ✅ Done | SQLite-backed `session` / `task` records |
| Full Pixel-Art UI | 🔄 In Progress | All HUD panels with pixel-art borders, pixel fonts, neon glow |
| NiagaBot Control Center Header | 🔄 In Progress | Live efficiency metrics, gateway status |
| Analytics Dashboard | 🔄 In Progress | Token usage, task success rate, gateway health |
| Bottom Tab Bar | 🔄 In Progress | Notifications / Logs / Settings navigation |
| Command Terminal | 🔄 In Progress | Always-visible quick task submission |
| Real-Time Pipeline Tracker | 🔄 In Progress | 6-stage visibility: submitted → received → routing → delegated → processing → done |
| Error Boundaries | ⬜ Planned | Game crash fallback UI |
| End-user authentication | ⬜ Planned | No multi-user login or RBAC yet |
| Responsive design | ⬜ Planned | Desktop-first currently |

## Success Criteria

- A user can connect to the gateway and see live agent activity.
- The visual roster includes all 24 agents and accurate OpenClaw mappings.
- Selecting an agent resolves uniquely by `agentId`, never by duplicate `spriteKey`.
- Assigning a task to a mapped seat enters through NiagaBot/main with the correct specialist metadata so downstream delegation can target the right OpenClaw workspace.
- The player sprite updates when the operative changes.
- Users can submit work from the terminal flow and see task status updates in the HUD.
- Page reload with a saved URL only auto-connects when no fresh runtime token is required.
- Local task/session APIs reject unauthorized requests.
- Documentation clearly explains product scope, architecture, and the multi-repo agent ecosystem.

## Release Readiness Gates

- Next.js production builds must stop ignoring TypeScript build errors before broader release.
- `tsconfig.json` should move back to stricter `noImplicitAny` enforcement.
- Prisma schema and runtime persistence tables should be aligned to avoid migration drift.
- Duplicate event/model types should be consolidated to reduce contract drift.
- Placeholder mood themes should either be implemented or hidden from the UI.
- `npm test`, `npm run lint`, and `npm run build` must be executed successfully in a working Node environment.

## Future Roadmap

- Session replay and timeline scrubbing for past runs
- More explicit seat-to-agent provisioning workflows, ideally seeded from gateway agent metadata
- Multi-office or multi-workspace support in a single browser session
- Multi-gateway support for operators overseeing more than one OpenClaw deployment
- Deep-link or interoperability flows with OpenClaw Control UI
- Richer analytics around throughput, failures, and model spend
- Better mobile and tablet operator layouts
- Read-only public wallboard mode for stakeholder viewing
- Stronger auth separation so browser clients never receive privileged gateway secrets
- User authentication and RBAC for multi-operator teams
- PWA support for installable app experience
- Plugin system for custom workspace extensions
