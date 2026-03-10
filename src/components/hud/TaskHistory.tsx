"use client";

import { useState, useMemo } from "react";
import { Search, X, CheckCircle, XCircle, Clock, Loader2, Trash2, Download, ChevronRight, TerminalSquare } from "lucide-react";
import { useStudio } from "@/lib/store";
import type { TaskItem } from "@/types/game";

interface TaskHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; animate?: boolean }> = {
  submitted: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/20" },
  queued: { icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  running: { icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/20", animate: true },
  completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
  stopped: { icon: XCircle, color: "text-orange-400", bg: "bg-orange-500/20" },
  returning: { icon: Loader2, color: "text-fuchsia-400", bg: "bg-fuchsia-500/20", animate: true },
};

export default function TaskHistory({ isOpen, onClose }: TaskHistoryProps) {
  const { state } = useStudio();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const filteredTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      const matchesSearch =
        search === "" ||
        task.message.toLowerCase().includes(search.toLowerCase()) ||
        task.taskId.toLowerCase().includes(search.toLowerCase()) ||
        task.actorName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [state.tasks, search, statusFilter]);

  const handleExport = () => {
    const data = JSON.stringify(state.tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-history-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (taskId: string) => {
    // In a real app, this would dispatch an action
    console.log("Delete task:", taskId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#02050a]/90 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-[#050a15] border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,240,255,0.2)] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b-2 border-cyan-500/50 bg-[#0a0f1c]">
          <div className="absolute top-0 left-0 w-2 h-2 border-r border-b border-cyan-400" />
          <h2 className="text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <TerminalSquare size={14} className="text-cyan-400" />
            Operations Log <span className="text-cyan-500">[{state.tasks.length}]</span>
          </h2>
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={handleExport}
              className="p-1.5 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors"
              title="EXPORT LOGS"
            >
              <Download size={14} />
            </button>
            <button
              onClick={onClose}
              title="Close Operations Log"
              className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-cyan-500/30 bg-[#02050a] flex gap-2 relative z-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="QUERY LOGS..."
              className="pixel-input w-full pl-7 text-[10px]"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by status"
              className="pixel-input pr-8 appearance-none text-[10px]"
            >
              <option value="all">ALL STATUSES</option>
              <option value="running">RUNNING</option>
              <option value="completed">COMPLETED</option>
              <option value="failed">FAILED</option>
              <option value="queued">QUEUED</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500">
              ▼
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar relative z-10">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-[10px] font-bold tracking-widest text-cyan-900 border-2 border-dashed border-cyan-900/50 m-4">
              NO OPERATIONS FOUND IN REGISTRY
            </div>
          ) : (
            filteredTasks.map((task) => {
              const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.submitted;
              const Icon = config.icon;

              return (
                <div
                  key={task.taskId}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-cyan-900/50 bg-[#050a15] hover:bg-cyan-900/20 cursor-pointer transition-colors group"
                >
                  {/* Status icon */}
                  <div className={`p-1.5 border border-cyan-500/20 ${config.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color} ${config.animate ? "animate-pulse" : ""}`} />
                  </div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white truncate uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                      {task.message}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 flex items-center gap-3 mt-1 tracking-widest uppercase">
                      <span className="text-cyan-700">{task.taskId.substring(0, 8)}</span>
                      {task.actorName && (
                        <span className="text-fuchsia-400">@{task.actorName}</span>
                      )}
                      <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-cyan-900 group-hover:text-cyan-400" />
                </div>
              );
            })
          )}
        </div>

        {/* Task detail modal */}
        {selectedTask && (
          <div className="absolute inset-0 bg-[#02050a]/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4 bg-[#050a15] border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-400 bg-cyan-950/30">
                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
                  OPERATION DETAILS
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  title="Close details"
                  className="p-1 text-cyan-500 hover:text-white hover:bg-red-500 transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-cyan-900 pb-3">
                  <div>
                    <label className="text-[8px] font-black text-cyan-700 uppercase tracking-widest block mb-1">Status</label>
                    <div className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 inline-block border ${STATUS_CONFIG[selectedTask.status]?.color?.replace('text-', 'border-').replace('400', '500/50')} ${STATUS_CONFIG[selectedTask.status]?.color || "text-white"}`}>
                      {selectedTask.status}
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-cyan-700 uppercase tracking-widest block mb-1">Actor Designation</label>
                    <div className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">{selectedTask.actorName || "SYSTEM ORCHESTRATOR"}</div>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-black text-cyan-700 uppercase tracking-widest block mb-1">Objective</label>
                  <div className="text-[10px] text-white leading-relaxed p-2 border border-cyan-900 bg-[#02050a]">
                    {selectedTask.message}
                  </div>
                </div>

                {selectedTask.result && (
                  <div>
                    <label className="text-[8px] font-black text-cyan-700 uppercase tracking-widest block mb-1">Execution Output</label>
                    <div className="text-[9px] text-cyan-300 font-mono bg-black border border-cyan-900 p-2 max-h-32 overflow-y-auto custom-scrollbar leading-relaxed">
                      {selectedTask.result}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-[8px] font-bold uppercase tracking-widest">
                  <div>
                    <span className="text-cyan-700 block">INITIATED</span>
                    <span className="text-slate-400">{new Date(selectedTask.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedTask.completedAt && (
                    <div>
                      <span className="text-cyan-700 block">CONCLUDED</span>
                      <span className="text-slate-400">{new Date(selectedTask.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleDelete(selectedTask.taskId);
                      setSelectedTask(null);
                    }}
                    className="w-full py-2 bg-red-500/10 border border-red-500 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={12} /> PURGE LOG ENTRY
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
