"use client";

import { useMemo } from "react";
import { useStudio } from "@/lib/store";

export default function AgentStatusPanel() {
  const { state } = useStudio();

  const stats = useMemo(() => {
    const working = state.seats.filter((s) => s.status === "running").length;
    const idle = state.seats.filter((s) => s.status === "empty" && s.assigned).length;
    const empty = state.seats.filter((s) => !s.assigned).length;
    return { working, idle, empty, total: state.seats.length };
  }, [state.seats]);

  const recentLogs = useMemo(
    () =>
      [...state.tasks]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3),
    [state.tasks],
  );

  const taskCount = state.tasks.length;
  const alertCount = state.tasks.filter(
    (t) => t.status === "failed" || t.status === "stopped",
  ).length;

  /* agent activity bar — 10 pixel blocks */
  function ActivityBar({ level }: { level: number }) {
    return (
      <div className="flex gap-[2px] mt-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={`ab-${i}`}
            className="w-[6px] h-[4px]"
            style={{
              backgroundColor:
                i < level ? "#00ff41" : "rgba(0,240,255,0.1)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pixel-panel flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#00f0ff]/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px]">⚡</span>
          <span className="pixel-font text-[8px] tracking-wider text-[#00f0ff] uppercase">
            Agent Status
          </span>
        </div>
        <span className="pixel-font text-[6px] px-2 py-0.5 border border-[#00ff41]/50 text-[#00ff41] tracking-wider uppercase">
          LIVE
        </span>
      </div>

      {/* ── Stats Summary ── */}
      <div className="flex justify-between px-3 py-2 border-b border-[#00f0ff]/20 bg-black/40">
        <div className="flex items-center gap-1">
          <span className="text-[8px]">⚡</span>
          <span className="pixel-font text-[7px] text-[#ffb800]">
            {stats.working}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px]">✓</span>
          <span className="pixel-font text-[7px] text-[#00ff41]">
            {stats.idle}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px]">○</span>
          <span className="pixel-font text-[7px] text-[#00f0ff]/40">
            {stats.empty}
          </span>
        </div>
      </div>

      {/* ── Agent List ── */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 pixel-scroll bg-black/10">
        {state.seats.length === 0 ? (
          <div className="py-6 text-center pixel-font text-[7px] tracking-widest uppercase text-[#00f0ff]/30 border border-dashed border-[#00f0ff]/20 mx-1">
            NO AGENTS DEPLOYED
          </div>
        ) : (
          state.seats.map((seat) => {
            const isRunning = seat.status === "running";
            const isFailed = seat.status === "failed";
            const dotColor = isRunning
              ? "#00ff41"
              : isFailed
                ? "#ff3366"
                : "#ffb800";
            const statusText = isRunning
              ? "ONLINE"
              : isFailed
                ? "ERROR"
                : "IDLE";
            const activityLevel = isRunning
              ? 8
              : isFailed
                ? 2
                : seat.assigned
                  ? 5
                  : 0;

            return (
              <div
                key={seat.seatId}
                className="px-2 py-2 bg-black/40 border border-[#00f0ff]/15 hover:border-[#00f0ff]/40 transition-all"
              >
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <div
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: dotColor,
                      boxShadow: isRunning
                        ? `0 0 6px ${dotColor}`
                        : "none",
                    }}
                  />
                  {/* Name */}
                  <span className="pixel-font text-[7px] text-[#e0e0ff] tracking-wider uppercase flex-1 truncate">
                    {seat.label}
                  </span>
                  {/* Status label */}
                  <span
                    className="pixel-font text-[6px] tracking-wider uppercase"
                    style={{ color: dotColor }}
                  >
                    {statusText}
                  </span>
                </div>
                <ActivityBar level={activityLevel} />
              </div>
            );
          })
        )}
      </div>

      {/* ── Task Logs ── */}
      <div className="px-3 py-2 border-t border-[#00f0ff]/20">
        <span className="pixel-font text-[7px] tracking-wider text-[#00f0ff]/60 uppercase block mb-1">
          Task Logs
        </span>
        {recentLogs.length === 0 ? (
          <span className="pixel-font text-[6px] text-[#00f0ff]/30">
            No tasks yet
          </span>
        ) : (
          recentLogs.map((task) => (
            <div
              key={task.taskId}
              className="pixel-font text-[6px] text-[#e0e0ff]/60 truncate leading-relaxed"
            >
              • Task: {task.message?.substring(0, 35) ?? task.taskId}
            </div>
          ))
        )}
      </div>

      {/* ── Bottom summary ── */}
      <div className="flex justify-between items-center px-3 py-2 border-t-2 border-[#00f0ff]/30 bg-black/60">
        <div>
          <span className="pixel-font text-[6px] text-[#00f0ff]/50 uppercase block">
            Agent
          </span>
          <span className="pixel-font text-[6px] text-[#e0e0ff]/80">
            {state.seats.length > 0
              ? `A: ${state.seats[0]?.label ?? "—"}`
              : "—"}
          </span>
        </div>
        <div className="text-right">
          <span className="pixel-font text-[7px] text-[#00f0ff]">
            TASKS:{" "}
            <span className="text-[#ffb800]">{taskCount}</span>
          </span>
          <span className="pixel-font text-[7px] text-[#ff3366] ml-2">
            ALERTS:{" "}
            <span>{alertCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
