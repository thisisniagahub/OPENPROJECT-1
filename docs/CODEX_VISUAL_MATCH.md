# Codex CLI: Match Reference Image Visuals

**Project**: `N:\OPENPROJECT\OPENPROJECT-1`  
**Reference**: The HUD must look like a pixel-art cyberpunk dashboard with rich SVG charts.

## CRITICAL RULES

1. ALL components MUST use `pixel-panel` borders (4px solid borders, NOT modern-glass)
2. NO `modern-glass`, NO `diagonal-cut`, NO `backdrop-blur`. Replace ALL with `pixel-panel`
3. Use CSS classes from `globals.css`: `pixel-panel`, `pixel-font`, `pixel-dot`, `pixel-gauge`, `pixel-header`, etc.
4. For charts, use inline SVG elements — no external charting libraries
5. Font: use `font-family: var(--font-pixel, 'Press Start 2P', monospace)` via `pixel-font` class
6. Color palette: `#00f0ff` (cyan), `#ff00ff` (magenta), `#00ff41` (green), `#ffb800` (amber), `#ff3366` (red)

---

## TASK 1: Rewrite `src/components/hud/AgentStatusPanel.tsx`

The AGENT STATUS panel on the LEFT side. Must match the reference image:

**Replace the ENTIRE file** with a pixel-art styled version:

Structure:

```
┌────────────────────────────┐
│ ⚡ AGENT STATUS      LIVE  │   <- pixel-panel header
├────────────────────────────┤
│ 🟢 ORA    ONLINE           │   <- Each agent from seats[],
│    ███████░░░               │      with small pixel activity bars
│ 🟢 REX    ONLINE           │
│    █████░░░░░               │
│ 🟢 KAI    ONLINE           │
│    ████████░░               │
├────────────────────────────┤
│ TASK LOGS                  │   <- Recent task log entries
│ • Task Log: ...            │
│ • Task Log: ...            │
│ • Task Log: ...            │
├────────────────────────────┤
│ AGENT                      │
│ A: ORA  B: REX             │
│ TASKS: 147   ALERTS: 3     │
└────────────────────────────┘
```

Implementation details:

- Use `'use client'` directive
- Import `useStudio` from `@/lib/store`
- Get `state.seats` for agent list, `state.tasks` for task logs/counts
- Each agent shows: colored dot (green=running, yellow=idle, gray=empty), name in UPPERCASE, "ONLINE"/"OFFLINE" status
- Below each agent name: a small activity bar (div with 10 small pixel blocks, colored based on status)
- TASK LOGS section: show last 3 tasks from `state.tasks` as bullet points: `• Task: {task.prompt?.substring(0,40)}`
- Bottom section: show TASKS count and ALERTS count (failed tasks)
- Use `pixel-panel` for border styling, `pixel-font` for text
- Remove ALL `modern-glass`, `diagonal-cut`, `backdrop-blur` classes
- No lucide-react icons needed — use emoji/text characters instead: ⚡ 🟢 🟡 ⚪ •

---

## TASK 2: Rewrite `src/components/hud/AnalyticsDashboard.tsx`

The CORE ANALYTICS panel on the RIGHT side. Must have RICH visualizations:

**Replace the ENTIRE file** with SVG-based charts:

Structure (matching reference image):

```
┌─────────────────────────────┐
│ CORE ANALYTICS       SF Pro │
├─────────────────────────────┤
│ SYSTEM LOAD    THREAT LEVEL │   <- Two side-by-side bar charts
│ ██             ████         │
│ ████           ██           │
│ ██████         █████        │
│ ████           ███          │
├─────────────────────────────┤
│      NETWORK HEALTH         │   <- Circular donut/ring chart (SVG)
│         ╭───╮               │
│        │ 85%│               │
│         ╰───╯               │
├─────────────────────────────┤
│ RESPONSE TIME  DATA TRAFFIC │
│ ⌇⌇⌇⌇⌇⌇⌇⌇     42.5hr      │   <- Wave line (SVG) + metrics
│                53.3K        │
│ 0ms  High      TRAFFIC:100 │
│                β:19%        │
└─────────────────────────────┘
```

Implementation:

### A. Props (keep same interface)

```typescript
interface AnalyticsDashboardProps {
  tokenUsage: number;   // 0-100 (maps to System Load)
  successRate: number;  // 0-100 (maps to Network Health ring)
  gatewayHealth: number; // 0-5 (maps to Threat Level)
  responseTime: number; // ms (maps to Response Time wave)
  activeSessions: number; // (maps to Data Traffic)
}
```

### B. System Load — Horizontal stacked bar chart (SVG)

- 4 horizontal bars with different colors: cyan, magenta, green, amber
- Each bar width based on random mock data (60%, 40%, 80%, 50%) when tokenUsage is 0, or proportional when > 0
- SVG viewBox="0 0 120 80", 4 `<rect>` elements stacked vertically

### C. Threat Level — Horizontal bar chart (SVG)

- 4 bars similar to System Load but different widths
- Colors: different shades of cyan/magenta
- Based on gatewayHealth value (0=all short, 5=all long)

### D. Network Health — Circular donut ring (SVG)

- SVG viewBox="0 0 100 100"
- Two circles: background ring (dark) + foreground arc (gradient cyan-to-magenta)
- `stroke-dasharray` and `stroke-dashoffset` for percentage fill
- Center text showing `successRate%` value
- Ring thickness: strokeWidth=8, radius=40, cx=50, cy=50

### E. Response Time — Wave line chart (SVG)

- SVG viewBox="0 0 120 40"
- `<path>` with bezier curves creating a wave pattern
- stroke="#00f0ff", fill with gradient below line
- Show responseTime value as text below

### F. Data Traffic — Numerical metrics

- Show `activeSessions` as large number
- Show calculated values: `{activeSessions * 0.53}K` as TRAFFIC
- Small text labels in pixel font

ALL text must use `className="pixel-font"` styling.
ALL panels must use `pixel-panel` borders.
NO inline styles except for SVG-specific attributes (stroke-dasharray etc).

---

## TASK 3: Fix styling in `src/components/hud/AgentStatusPanel.tsx`

After rewriting, verify:

- NO `modern-glass` class anywhere
- NO `diagonal-cut` class anywhere  
- NO `backdrop-blur` anywhere
- ALL borders use `pixel-panel` or `border-2 border-[#00f0ff]/30` style
- Text uses `pixel-font` or hardcoded `font-family: 'Press Start 2P', monospace`

---

## EXECUTION

Run tasks 1 and 2. After completion, run `npx tsc --noEmit` and fix any errors.
