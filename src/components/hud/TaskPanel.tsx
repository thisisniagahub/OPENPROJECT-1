"use client";

import type { TaskItem } from "@/types/game";
import { formatRelativeTime } from "@/lib/constants";

function taskStatusLabel(status: TaskItem["status"]) {
  switch (status) {
    case "queued": return "queued";
    case "returning": return "returning";
    case "submitted": return "sending";
    case "stopped": return "stopped";
    default: return status;
  }
}

export default function TaskPanel({ tasks }: { tasks: TaskItem[] }) {
  const runningTasks = tasks.filter((task) =>
    ["running", "submitted", "queued", "returning"].includes(task.status)
  );

  return (
    <div className="modern-glass flex flex-col h-full pointer-events-auto border-cyber-muted/30 relative">
      {/* HEADER */}
      <div className="flex-none px-5 py-3 bg-cyber-primary/5 border-b border-cyber-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyber-primary shadow-[0_0_8px_var(--cyber-primary)]" />
          <h2 className="text-[12px] font-cyber-display font-bold text-cyber-primary tracking-[0.2em] uppercase">MISSION_LOG</h2>
        </div>
        <div className="text-[10px] font-cyber-mono font-bold text-cyber-muted/60 uppercase tracking-[0.1em]">
          {runningTasks.length} EXEC // {tasks.length} SYNCED
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-30 uppercase tracking-[0.3em] font-cyber-display font-bold text-[11px] text-cyber-primary">
            [ NO MISSION DATA STREAM ]
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.taskId} className="px-4 py-3 border border-cyber-muted/10 bg-black/30 relative group hover:border-cyber-primary/30 transition-all duration-300 diagonal-cut">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyber-muted/40 group-hover:bg-cyber-primary/60 transition-all duration-300" />
              <div className="flex justify-between items-center mb-2 pl-3">
                <span className={`text-[9px] font-cyber-mono font-bold uppercase px-2 py-0.5 border ${task.status === "running" ? "bg-cyber-primary/10 text-cyber-primary border-cyber-primary/40 shadow-[0_0_8px_rgba(0,240,255,0.2)] animate-pulse" :
                    task.status === "failed" ? "bg-cyber-accent-red/10 text-cyber-accent-red border-cyber-accent-red/40" :
                      "bg-cyber-muted/10 text-cyber-muted border-cyber-muted/20"
                  }`}>
                  {taskStatusLabel(task.status)}
                </span>
                <span className="text-[9px] font-cyber-mono text-cyber-muted/40 uppercase tracking-[0.1em]">
                  {formatRelativeTime(task.completedAt ?? task.createdAt)}
                </span>
              </div>
              <div className="text-[11px] font-cyber-mono font-medium text-cyber-text/80 uppercase tracking-tight leading-relaxed pl-3 line-clamp-3">
                {task.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
