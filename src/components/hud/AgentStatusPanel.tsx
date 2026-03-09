"use client";

import { useMemo } from "react";
import { Users, Clock, Zap, CheckCircle, XCircle, Circle } from "lucide-react";
import { useStudio } from "@/lib/store";
import { formatCompact } from "@/lib/constants";

export default function AgentStatusPanel() {
  const { state } = useStudio();

  const stats = useMemo(() => {
    const working = state.seats.filter((s) => s.status === "running").length;
    const idle = state.seats.filter((s) => s.status === "empty" && s.assigned).length;
    const empty = state.seats.filter((s) => !s.assigned).length;
    return { working, idle, empty, total: state.seats.length };
  }, [state.seats]);

  const tokenPercent = useMemo(() => {
    if (!state.sessionMetrics.maxContextTokens) return 0;
    return Math.min(
      100,
      ((state.sessionMetrics.usedTokens || 0) / state.sessionMetrics.maxContextTokens) * 100
    );
  }, [state.sessionMetrics]);

  const getTokenColor = () => {
    if (tokenPercent > 80) return "bg-red-500";
    if (tokenPercent > 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-64 bg-slate-900/95 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            Agents
          </span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="px-3 py-2 border-b border-slate-800 flex justify-between">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400">{stats.working}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">{stats.idle}</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-slate-500" />
          <span className="text-xs text-slate-500">{stats.empty}</span>
        </div>
      </div>

      {/* Token usage */}
      {state.sessionMetrics.usedTokens && (
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Tokens</span>
            <span className="text-xs text-white">
              {formatCompact(state.sessionMetrics.inputTokens)} / {formatCompact(state.sessionMetrics.outputTokens)}
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getTokenColor()} transition-all duration-300`}
              style={{ width: `${tokenPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Model */}
      {state.sessionMetrics.model && (
        <div className="px-3 py-2 border-b border-slate-800">
          <span className="text-xs text-slate-400">Model: </span>
          <span className="text-xs text-purple-400">{state.sessionMetrics.model.split("/").pop()}</span>
        </div>
      )}

      {/* Agent list */}
      <div className="max-h-48 overflow-y-auto">
        {state.seats.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            No agents assigned
          </div>
        ) : (
          state.seats.map((seat) => (
            <div
              key={seat.seatId}
              className="px-3 py-2 border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {/* Status indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    seat.status === "running"
                      ? "bg-yellow-400 animate-pulse"
                      : seat.status === "done"
                      ? "bg-green-400"
                      : seat.status === "failed"
                      ? "bg-red-400"
                      : seat.assigned
                      ? "bg-slate-400"
                      : "bg-slate-700"
                  }`}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                    {seat.label}
                  </div>
                  {seat.roleTitle && (
                    <div className="text-xs text-slate-500 truncate">{seat.roleTitle}</div>
                  )}
                </div>

                {/* Task snippet or time */}
                {seat.status === "running" && seat.taskSnippet ? (
                  <div className="text-xs text-yellow-400 truncate max-w-[80px]">
                    {seat.taskSnippet}
                  </div>
                ) : seat.startedAt ? (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {Math.floor((Date.now() - new Date(seat.startedAt).getTime()) / 60000)}m
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
