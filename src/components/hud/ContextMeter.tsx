"use client";

import type { CSSProperties } from "react";
import { formatCompact } from "@/lib/constants";

interface ContextMeterProps {
  usedTokens?: number;
  maxTokens?: number;
  fresh: boolean;
}

export default function ContextMeter({
  usedTokens,
  maxTokens,
  fresh,
}: ContextMeterProps) {
  const hasValues =
    typeof usedTokens === "number" &&
    Number.isFinite(usedTokens) &&
    typeof maxTokens === "number" &&
    Number.isFinite(maxTokens) &&
    maxTokens > 0;
  const remaining = hasValues ? Math.max(1 - usedTokens / maxTokens, 0) : 1;
  const remainPct = Math.round(remaining * 100);
  const usedPct = hasValues ? Math.min(((usedTokens ?? 0) / (maxTokens ?? 1)) * 100, 100) : 0;

  const barColorClass = !fresh
    ? "bg-slate-500"
      : remaining > 0.5
        ? "bg-green-500"
      : remaining > 0.2
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="modern-glass p-3 border-cyber-muted/20 flex flex-col gap-2 min-w-[200px] diagonal-cut">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyber-primary rotate-45" />
          <span className="text-[10px] font-cyber-display font-bold tracking-[0.2em] text-cyber-primary uppercase">Neural_Context</span>
        </div>
        <div className="text-[10px] font-cyber-mono font-bold text-cyber-text">
          {Math.max(0, 100 - remainPct)}%
        </div>
      </div>
      <div className="h-2 bg-cyber-background border border-cyber-muted/30 relative overflow-hidden">
        <div
          className="h-full bg-cyber-primary shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-1000 ease-out"
          style={{
            width: `${usedPct}%`,
            backgroundColor: usedPct > 80 ? "var(--cyber-accent-red)" : "var(--cyber-primary)"
          } as CSSProperties}
        />
      </div>
      <div className="text-[7px] font-bold text-cyan-700 text-right uppercase tracking-widest leading-none">
        {hasValues ? `${remainPct}% AVAL` : "AWAITING SIG"}
      </div>
    </div>
  );
}
