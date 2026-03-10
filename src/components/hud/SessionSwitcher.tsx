"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { useStudio } from "@/lib/store";
import { formatRelativeTime } from "@/lib/constants";
import type { SessionRecord } from "@/types/game";

export default function SessionSwitcher({
  sessions,
  activeKey,
}: {
  sessions: SessionRecord[];
  activeKey?: string;
}) {
  const { newSession, switchSession } = useStudio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeLabel =
    sessions.find((s) => s.key === activeKey)?.label ?? activeKey?.split(":").pop() ?? "DEFAULT_OP";

  return (
    <div ref={ref} className="relative z-50">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-1 bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 transition-colors text-cyan-400 font-bold max-w-[140px]"
          onClick={() => setOpen((prev) => !prev)}
          title="SWITCH DATA STREAM"
        >
          <span className="text-[10px] uppercase tracking-widest truncate">{activeLabel}</span>
          <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          className="p-1 px-2 border bg-magenta-500/20 border-magenta-500/50 hover:bg-magenta-500 hover:text-white text-magenta-400 transition-colors"
          onClick={() => { newSession(); setOpen(false); }}
          title="INIT NEW CONNECTION"
        >
          <Plus size={14} />
        </button>
      </div>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-[200px] bg-[#050a15] border border-cyan-500/50 shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center">
              NO ARCHIVES
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.key === activeKey;
              return (
                <button
                  key={session.key}
                  type="button"
                  className={`flex flex-col items-start px-3 py-2 border-b border-slate-800/50 transition-colors text-left w-full hover:bg-cyan-500/10 ${isActive ? "bg-cyan-500/20 border-l-2 border-l-cyan-400" : "border-l-2 border-l-transparent"
                    }`}
                  onClick={() => { switchSession(session.key); setOpen(false); }}
                >
                  <div className={`text-[10px] uppercase tracking-widest truncate w-full ${isActive ? "text-cyan-400 font-black" : "text-white font-bold"}`}>
                    {session.label ?? session.key.split(":").pop() ?? "ARCHIVE_LOG"}
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {formatRelativeTime(session.createdAt)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
