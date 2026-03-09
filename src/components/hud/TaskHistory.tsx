"use client";

import { useState, useMemo } from "react";
import { Search, X, CheckCircle, XCircle, Clock, Loader2, Trash2, Download, ChevronRight } from "lucide-react";
import { useStudio } from "@/lib/store";
import type { TaskItem } from "@/types/game";

interface TaskHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; animate?: boolean }> = {
  submitted: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/20" },
  queued: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
  running: { icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/20", animate: true },
  completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
  stopped: { icon: XCircle, color: "text-orange-400", bg: "bg-orange-500/20" },
  returning: { icon: Loader2, color: "text-purple-400", bg: "bg-purple-500/20", animate: true },
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
          <h2 className="text-sm font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            Task History ({state.tasks.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Export Tasks"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-slate-700 flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              style={{ fontFamily: '"Ark Pixel", monospace' }}
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-purple-500"
            style={{ fontFamily: '"Ark Pixel", monospace' }}
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </div>

        {/* Task list */}
        <div className="max-h-80 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              No tasks found
            </div>
          ) : (
            filteredTasks.map((task) => {
              const config = STATUS_CONFIG[task.status];
              const Icon = config.icon;

              return (
                <div
                  key={task.taskId}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  {/* Status icon */}
                  <div className={`p-2 rounded ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color} ${config.animate ? "animate-spin" : ""}`} />
                  </div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                      {task.message}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      {task.actorName && (
                        <span className="text-purple-400">{task.actorName}</span>
                      )}
                      <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              );
            })
          )}
        </div>

        {/* Task detail modal */}
        {selectedTask && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-full max-w-md mx-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <h3 className="text-sm font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                  Task Details
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Task ID</label>
                  <div className="text-xs text-white font-mono">{selectedTask.taskId}</div>
                </div>

                <div>
                  <label className="text-xs text-slate-500">Message</label>
                  <div className="text-xs text-white">{selectedTask.message}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Status</label>
                    <div className={`text-xs ${STATUS_CONFIG[selectedTask.status]?.color || "text-white"}`}>
                      {selectedTask.status}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Actor</label>
                    <div className="text-xs text-purple-400">{selectedTask.actorName || "Unassigned"}</div>
                  </div>
                </div>

                {selectedTask.result && (
                  <div>
                    <label className="text-xs text-slate-500">Result</label>
                    <div className="text-xs text-white bg-slate-900 p-2 rounded max-h-32 overflow-y-auto">
                      {selectedTask.result}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Created</label>
                    <div className="text-xs text-white">{new Date(selectedTask.createdAt).toLocaleString()}</div>
                  </div>
                  {selectedTask.completedAt && (
                    <div>
                      <label className="text-xs text-slate-500">Completed</label>
                      <div className="text-xs text-white">{new Date(selectedTask.completedAt).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    handleDelete(selectedTask.taskId);
                    setSelectedTask(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={14} />
                  <span className="text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>Delete Task</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
