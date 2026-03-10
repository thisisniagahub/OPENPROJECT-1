"use client";

interface AnalyticsDashboardProps {
  tokenUsage: number;
  successRate: number;
  gatewayHealth: number;
  responseTime: number;
  activeSessions: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/* ── Tiny SVG sub‑components ─────────────────────────────── */

function BarChart({ bars, label }: { bars: number[]; label: string }) {
  const h = 14;
  const gap = 3;
  const maxW = 56;
  return (
    <div className="flex flex-col gap-1">
      <span className="pixel-font text-[7px] tracking-wider text-[#00f0ff]/70 uppercase">
        {label}
      </span>
      <svg
        viewBox={`0 0 ${maxW} ${bars.length * (h + gap)}`}
        width={maxW}
        height={bars.length * (h + gap)}
        className="block"
      >
        {bars.map((pct, i) => {
          const colors = ["#00f0ff", "#ff00ff", "#00ff41", "#ffb800"];
          const w = (clamp(pct, 5, 100) / 100) * maxW;
          return (
            <rect
              key={`bar-${label}-${i}`}
              x={0}
              y={i * (h + gap)}
              width={w}
              height={h}
              fill={colors[i % colors.length]}
              opacity={0.85}
              rx={1}
            />
          );
        })}
      </svg>
    </div>
  );
}

function DonutRing({ percent }: { percent: number }) {
  const r = 36;
  const stroke = 7;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp(percent, 0, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="pixel-font text-[7px] tracking-wider text-[#00f0ff]/70 uppercase">
        Network Health
      </span>
      <svg viewBox="0 0 100 100" width={90} height={90} className="block">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
        </defs>
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={stroke}
        />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className="transition-all duration-700"
        />
        <text
          x={50}
          y={48}
          textAnchor="middle"
          className="pixel-font"
          fill="#00f0ff"
          fontSize={10}
        >
          {Math.round(percent)}%
        </text>
        <text
          x={50}
          y={62}
          textAnchor="middle"
          className="pixel-font"
          fill="#00f0ff"
          fontSize={5}
          opacity={0.5}
        >
          UPTIME
        </text>
      </svg>
    </div>
  );
}

function WaveLine({ value }: { value: number }) {
  /* simple bezier wave — height varies with response time */
  const h = clamp(value / 50, 2, 30);
  const d = `M0,20 C10,${20 - h} 20,${20 + h} 30,20 C40,${20 - h * 0.8} 50,${20 + h * 0.6} 60,20 C70,${20 - h * 0.5} 80,${20 + h * 0.3} 90,18 C100,${20 - h * 0.2} 110,19 120,20`;
  return (
    <div className="flex flex-col gap-1">
      <span className="pixel-font text-[7px] tracking-wider text-[#00f0ff]/70 uppercase">
        Response Time
      </span>
      <svg viewBox="0 0 120 40" width={120} height={36} className="block">
        <defs>
          <linearGradient id="wave-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${d} L120,40 L0,40 Z`} fill="url(#wave-fill)" />
        <path d={d} fill="none" stroke="#00f0ff" strokeWidth={1.5} />
      </svg>
      <div className="flex justify-between pixel-font text-[6px] text-[#00f0ff]/50">
        <span>0ms</span>
        <span className="text-[#00f0ff]">{value}ms</span>
        <span>High</span>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export default function AnalyticsDashboard({
  tokenUsage,
  successRate,
  gatewayHealth,
  responseTime,
  activeSessions,
}: AnalyticsDashboardProps) {
  const safe = {
    token: clamp(tokenUsage, 0, 100),
    success: clamp(successRate, 0, 100),
    gw: clamp(Math.round(gatewayHealth), 0, 5),
  };

  /* derive bar lengths from metrics */
  const loadBars = [
    safe.token * 0.8 + 20,
    safe.token * 0.5 + 10,
    safe.token * 0.9 + 15,
    safe.token * 0.6 + 5,
  ];
  const threatBars = [
    safe.gw * 18 + 10,
    safe.gw * 14 + 5,
    safe.gw * 20 + 8,
    safe.gw * 12 + 3,
  ];

  const dataTraffic = (activeSessions * 53.3).toFixed(1);

  return (
    <div className="pixel-panel flex h-full flex-col gap-3 p-3 overflow-y-auto pixel-scroll">
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="pixel-font text-[8px] tracking-wider text-[#00f0ff]">
          CORE ANALYTICS
        </span>
        <span className="pixel-font text-[6px] text-[#ff00ff]/60">SF Pro</span>
      </div>

      {/* Bar Charts Row */}
      <div className="flex gap-3">
        <BarChart bars={loadBars} label="System Load" />
        <BarChart bars={threatBars} label="Threat Level" />
      </div>

      {/* Donut Ring */}
      <DonutRing percent={safe.success} />

      {/* Wave + Data Traffic */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <WaveLine value={responseTime} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="pixel-font text-[7px] tracking-wider text-[#00f0ff]/70 uppercase">
            Data Traffic
          </span>
          <span className="pixel-font text-[11px] text-[#ffb800]">
            {dataTraffic}K
          </span>
          <span className="pixel-font text-[6px] text-[#00f0ff]/50">
            TRAFFIC: {activeSessions * 100}
          </span>
          <span className="pixel-font text-[6px] text-[#ff00ff]/50">
            β: {Math.round(safe.success * 0.19)}%
          </span>
        </div>
      </div>
    </div>
  );
}
