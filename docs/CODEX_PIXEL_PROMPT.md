# Codex CLI Prompt: Pixel-Art UI Implementation

**Project**: `N:\OPENPROJECT\OPENPROJECT-1` (Next.js 16 + React + TypeScript)

## CRITICAL RULES

1. Do NOT modify `globals.css` — Phase 1 CSS is already complete with all pixel-art classes
2. Do NOT modify `store.ts`, `server-store.ts`, `route.ts` — these are LOCKED
3. Use ONLY existing CSS classes from `globals.css`: `pixel-panel`, `pixel-input`, `pixel-btn`, `pixel-btn--primary`, `pixel-btn--danger`, `pixel-btn--success`, `pixel-btn--sm`, `pixel-progress`, `pixel-progress__fill`, `pixel-header`, `pixel-header__title`, `pixel-header__badge`, `pixel-header__metric`, `pixel-tab-bar`, `pixel-tab`, `pixel-tab--active`, `pixel-tab__badge`, `pixel-pipeline`, `pixel-pipeline__stage`, `pixel-pipeline__dot`, `pixel-pipeline__dot--done`, `pixel-pipeline__dot--active`, `pixel-pipeline__dot--pending`, `pixel-pipeline__dot--failed`, `pixel-pipeline__connector`, `pixel-pipeline__label`, `pixel-gauge`, `pixel-gauge__label`, `pixel-gauge__value`, `pixel-gauge__bar`, `pixel-gauge__fill`, `pixel-gauge__dots`, `pixel-gauge__dot`, `pixel-terminal`, `pixel-terminal__prompt`, `pixel-terminal__input`, `pixel-toggle`, `pixel-toggle__knob`, `pixel-toggle--active`, `pixel-scroll`, `pixel-font`, `pixel-dot`, `pixel-dot--green`, `pixel-dot--yellow`, `pixel-dot--red`, `hud-pill`, `hud-status`, `hud-status--pending`, `hud-status--running`, `hud-status--completed`, `hud-status--failed`
4. All components must be TypeScript React functional components with `'use client'` directive
5. Import types from `@/types/game` and data from `@/lib/agent-data`
6. Use `useGameStore()` from `@/lib/store` for state access

---

## TASK 1: Add Pipeline Types to `src/types/game.ts`

Add these types AFTER the existing `GameEventMap`:

```typescript
export type PipelineStage = 
  | 'submitted'
  | 'received'
  | 'routing'
  | 'delegated'
  | 'processing'
  | 'completed'
  | 'failed';

export interface PipelineStageState {
  timestamp?: number;
  detail?: string;
}

export interface TaskPipelineState {
  taskId: string;
  currentStage: PipelineStage;
  stages: Partial<Record<PipelineStage, PipelineStageState>>;
  delegatedTo?: string;
  elapsed?: number;
}
```

---

## TASK 2: Create `src/components/hud/PixelHeader.tsx`

NiagaBot Control Center header component.

- Uses `pixel-header` CSS classes
- Props: `isConnected: boolean`, `taskCount: number`, `completedCount: number`
- Shows title "NIAGABOT CONTROL CENTER"
- Shows ACTIVE/INACTIVE badge based on `isConnected`
- Shows efficiency metric: `(completedCount / taskCount * 100).toFixed(1)%`
- Shows task count: `taskCount` total

---

## TASK 3: Create `src/components/hud/AnalyticsDashboard.tsx`

Analytics panel with pixel-art gauges.

- Uses `pixel-panel`, `pixel-gauge` CSS classes
- Props: `tokenUsage: number` (0-100%), `successRate: number` (0-100%), `gatewayHealth: number` (0-5 dots), `responseTime: number` (ms), `activeSessions: number`
- 5 gauge rows:
  1. TOKEN USAGE — `pixel-gauge__bar` with fill width based on percentage
  2. SUCCESS RATE — `pixel-gauge__bar` with green fill
  3. GATEWAY HEALTH — `pixel-gauge__dots` with 5 dots, `pixel-gauge__dot--filled` for healthy ones
  4. RESPONSE TIME — display as `{responseTime}ms` text
  5. ACTIVE SESSIONS — display as counter

---

## TASK 4: Create `src/components/hud/PixelTabBar.tsx`

Bottom tab navigation.

- Uses `pixel-tab-bar`, `pixel-tab`, `pixel-tab--active`, `pixel-tab__badge` CSS classes
- Props: `activeTab: string`, `onTabChange: (tab: string) => void`, `notificationCount?: number`
- 4 tabs: NOTIFICATIONS (with badge if count > 0), LOGS, SETTINGS, MORE (⋯)
- Call `onTabChange` on tab click

---

## TASK 5: Create `src/components/hud/CommandTerminal.tsx`

Always-visible terminal input.

- Uses `pixel-terminal`, `pixel-terminal__prompt`, `pixel-terminal__input` CSS classes
- Props: `onSubmit: (command: string) => void`
- Shows prompt `NIAGABOT>`
- Input field for command
- Submit on Enter key
- Clear input after submit

---

## TASK 6: Create `src/components/hud/TaskPipelineTracker.tsx`

Real-time 6-stage pipeline visualization.

- Uses `pixel-panel`, `pixel-pipeline`, `pixel-pipeline__stage`, `pixel-pipeline__dot`, `pixel-pipeline__connector`, `pixel-pipeline__label`, `pixel-pipeline__time`, `pixel-pipeline__agent` CSS classes
- Props: `pipeline: TaskPipelineState | null` (import from `@/types/game`)
- 6 stages rendered horizontally: SUBMITTED → RECEIVED → ROUTING → DELEGATED → PROCESSING → DONE
- Each stage gets dot class based on status:
  - Stages before `currentStage` → `pixel-pipeline__dot--done`
  - Current stage → `pixel-pipeline__dot--active`
  - Future stages → `pixel-pipeline__dot--pending`
  - If currentStage is 'failed' → that stage gets `pixel-pipeline__dot--failed`
- Connectors between stages get `--done` or `--active` class
- Labels get `--done` or `--active` class
- If `pipeline` is null, show all stages as pending with text "AWAITING TASK..."
- Display `pipeline.delegatedTo` below the DELEGATED stage if present
- Display elapsed time if available

---

## TASK 7: Update `src/components/hud/GameHud.tsx`

Restructure the main HUD layout. READ the existing file first, then modify:

1. Import the 5 new components: `PixelHeader`, `AnalyticsDashboard`, `PixelTabBar`, `CommandTerminal`, `TaskPipelineTracker`
2. Add state for `activeTab` (default: 'notifications')
3. Remove the `hud-overlay` wrapper — restructure to full-width layout below game
4. New layout structure (top to bottom):
   - `PixelHeader` (full width)
   - 3-column grid: Left = `AgentStatusPanel`, Center = `TaskPipelineTracker` + existing panels based on active tab, Right = `AnalyticsDashboard`
   - `PixelTabBar` (full width)
   - `CommandTerminal` (full width)
5. Pass real data from store to all components:
   - `isConnected` from gateway status
   - `taskCount` and `completedCount` from tasks array
   - `tokenUsage` from context meter values
   - For AnalyticsDashboard: calculate from store state
6. Wire `CommandTerminal.onSubmit` to create tasks via the store

---

## EXECUTION ORDER

Execute tasks 1 through 7 in order. Each task depends on the previous.

## VERIFICATION

After all tasks, run:

```bash
npx tsc --noEmit
```

Fix any TypeScript errors found.
