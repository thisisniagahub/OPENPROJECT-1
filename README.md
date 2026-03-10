<p align="center">
  <img src="public/logo.png" alt="Agent Town" width="120" />
</p>

<h1 align="center">Agent Town</h1>

<p align="center">
  <strong>A spatial operator console for OpenClaw fleets powered by Next.js 16 + Phaser 3</strong>
</p>

<p align="center">
  <a href="#what-is-agent-town">What Is Agent Town?</a> •
  <a href="#features">Features</a> •
  <a href="#agent-ecosystem">Agent Ecosystem</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#testing">Testing</a>
</p>

---

## What Is Agent Town?

Agent Town is an interactive pixel-art control surface for teams running OpenClaw agent fleets. It connects to an OpenClaw gateway over WebSocket and visualizes mapped agents as workers in a virtual office. Users can connect to a gateway, assign work, inspect task history, watch streamed responses, and manage how agents are represented inside the office.

It is the visual frontend for a larger multi-repo agent ecosystem rather than the place where OpenClaw workspaces are authored, paired, or deployed.

## Product Positioning

Agent Town is designed as an OpenClaw-first browser surface:

- OpenClaw remains the system of record for agent execution, routing, tools, models, sessions, and channel integrations.
- Agent Town owns spatial visualization, operator workflows, seat-to-agent mapping, and app-local operator history.
- Visual workers may exist without a live OpenClaw mapping, but mapped seats must route through canonical `openclawId` identities.
- Operator-originated requests enter through the NiagaBot/main session, while seat mappings act as delegation hints for downstream specialists.
- The product complements OpenClaw Control UI instead of replacing gateway onboarding, channel pairing, or privileged fleet administration.

## Recommended Deployment Topology

```text
Operator browser
  -> Agent Town (Next.js + Phaser)
  -> OpenClaw gateway
  -> OpenClaw workspaces / agents
```

Recommended access patterns for a remote gateway:

- local gateway on the same machine
- secure `wss://` endpoint behind TLS
- SSH tunnel to the gateway port
- Tailscale-served private access

Avoid treating Agent Town as a public replacement for exposed gateway or Control UI access.

## Features

### Game Layer

- Isometric office scene rendered with Phaser 3
- 24 visual agents across 6 departments
- Seat discovery from the office map
- Worker movement, bubbles, and task state visualization
- Unique operative selection keyed by agent ID, plus office editor support

### HUD Layer

- Connection controls for OpenClaw gateway URL and runtime token
- Seat manager for assigning office seats to mapped OpenClaw agents
- Task history, worker availability, session metrics, and settings
- Model selection from the connected gateway
- Onboarding, keyboard shortcuts, and terminal task submission flow
- **NiagaBot Control Center** header with live efficiency metrics and gateway status
- **Analytics Dashboard** with token usage, task success rate, gateway health, and response time
- **Bottom Tab Bar** for Notifications, Logs, and Settings
- **Command Terminal** for always-visible quick task submission
- **Full Pixel-Art Aesthetic**: All HUD panels use pixel-art borders, pixel fonts (Ark Pixel / Press Start 2P), neon glow accents, and scanline overlay — visually consistent with the isometric game layer.

### Gateway Integration

- WebSocket client with reconnect, handshake, and heartbeat behavior
- Request and event dispatch layer for OpenClaw traffic
- Session-aware task and chat state in the browser
- Durable app-local session/task history through protected API routes
- Seat-targeted tasks preserve mapped specialist metadata while entering OpenClaw through NiagaBot/main

## OpenClaw Mapping Model

Agent Town deliberately separates three identities:

- `agentId`
  Stable visual/runtime identity inside the browser app
- `spriteKey`
  Shared Phaser rendering identity
- `openclawId`
  Canonical OpenClaw workspace identity used for delegation hints and specialist mapping

That separation matters because the office can stay visually expressive while still attaching the right specialist hints for NiagaBot/main to honor when delegating real work to deployed OpenClaw agents.

## Agent Ecosystem

Agent Town spans 24 visual agents across 6 departments:

| Department | Count |
|-----------|-------|
| Intel | 3 |
| Content | 9 |
| Commerce | 6 |
| Ops | 3 |
| Research | 1 |
| Labs | 2 |

Each operative keeps a unique `agentId` identity even when multiple operatives reuse the same sprite sheet. Seats can map those operatives to deployed OpenClaw workspace agents through `openclawId`, and seat-targeted work carries that mapping into the NiagaBot/main session as a delegation hint instead of bypassing the coordinator.

### 3-Repo Architecture

- `OPENPROJECT-1`
  Visual frontend and game workspace for Agent Town.
- `social-growth-suite`
  17 OpenClaw workspace agents deployed separately behind the gateway.
- `brand-research-agent`
  1 standalone OpenClaw workspace agent deployed separately.

This means the browser app owns presentation, seat logic, and lightweight operator workflows, while the gateway-backed workspaces own real execution behavior and NiagaBot remains the sole user-facing gateway entry point.

## System Boundaries

Agent Town is responsible for:

- office visualization and worker presence
- operator-facing task submission and monitoring
- seat labels, seat mappings, and local workspace preferences
- app-local persistence for operator history

OpenClaw is responsible for:

- workspace code, tools, and skill behavior
- model/provider configuration
- routing, execution, and long-lived session semantics
- channel pairing, node behavior, and security-sensitive gateway policy

## Documentation

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)

### Design System

- **Fonts**: Ark Pixel (primary pixel font), Press Start 2P (fallback pixel font)
- **Panels**: `pixel-panel` with 2px solid neon borders, zero border-radius, scanline overlay
- **Colors**: Neon cyan (`#00f0ff`), matrix green (`#00ff00`), warning yellow (`#ffff00`), alert red (`#ff0033`), fuchsia (`#ff00ff`) — all on dark navy backgrounds
- **Layout**: Game viewport top, NiagaBot Control Center header, 3-column HUD panels, bottom tab bar, command terminal

## Quick Start

### Prerequisites

- Node.js 22+
- An OpenClaw gateway reachable over WebSocket

### Install

```bash
npm install
cp .env.example .env.local
```

Configure these values in `.env.local`:

- `DATABASE_URL`
  Local persistence for Agent Town task/session history
- `OPENPROJECT_API_TOKEN`
  Required for protected `/api/task` and `/api/session` routes
- `NEXT_PUBLIC_GATEWAY_URL`
  Optional gateway URL seed for the browser

Enter the gateway token in the UI at runtime instead of baking it into public browser env. After a reload, the app restores the saved gateway URL and only auto-reconnects when the stored config does not require a fresh runtime token.

### Remote Gateway Access

If your OpenClaw gateway lives on a VPS, prefer one of these patterns:

- tunnel the gateway locally with SSH
- expose it through private Tailscale access
- terminate TLS and use a private `wss://` endpoint

Do not rely on a browser default like `ws://127.0.0.1:18789` for a deployed multi-user environment.

### Run

```bash
npx next dev -p 3000
```

Open `http://localhost:3000`, connect to your gateway, then use the terminal interaction flow in the office to assign tasks.

## Architecture

### High-Level Flow

```text
Browser
  -> Next.js App
  -> Phaser office + React HUD
  -> Store + reducer
  -> Gateway client
  -> OpenClaw WebSocket gateway
```

### Key Directories

```text
src/
├── app/                 # Next.js pages and API routes
├── components/
│   ├── game/            # Phaser scenes, entities, config
│   ├── hud/             # Operator panels and overlays
│   ├── editor/          # Office editor
│   ├── panel/           # Terminal modal and panel shells
│   └── ui/              # Shared UI primitives
├── lib/                 # Store, reducer, gateway, agent registry
├── hooks/               # Client hooks
├── types/               # Shared TypeScript types
└── __tests__/           # Vitest suites
```

## API Routes

The app currently ships with 5 routes:

- `/api`
- `/api/health`
- `/api/models`
- `/api/session`
- `/api/task`

`/api/session` and `/api/task` provide Agent Town's own durable operator history and are protected with `OPENPROJECT_API_TOKEN`. They do not replace OpenClaw's own routing or session source of truth.

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite/Prisma connection for Agent Town persistence |
| `OPENPROJECT_API_TOKEN` | Server-side bearer token for protected local API routes |
| `NEXT_PUBLIC_GATEWAY_URL` | OpenClaw gateway WebSocket URL |
| `NEXT_PUBLIC_DEBUG` | Enable client debug logging |
| `NEXT_PUBLIC_ENABLE_SOUND` | Enable sound effects |
| `NEXT_PUBLIC_ENABLE_MUSIC` | Enable background music |

## Testing

```bash
npx vitest run
```

The project uses Vitest for focused unit and UI coverage around:

- agent registry, unique operative identity, and OpenClaw ID mappings
- sprite registry and animation metadata
- gateway client routing behavior
- reducer, persistence, and seat assignment flows
- targeted UI coverage for character and seat selection behavior

## Build

```bash
npx next build
```

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm test
```

## License

This project is private and proprietary.
