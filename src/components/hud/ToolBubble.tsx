"use client";

import { useState } from "react";
import type { ToolChatMessage } from "@/types/game";

function parseToolParts(msg: ToolChatMessage): { summary: string; detail: string | null } {
  let summary = msg.toolName;
  if (msg.toolInput) {
    try {
      const parsed = JSON.parse(msg.toolInput);
      const hint =
        parsed.command ?? parsed.path ?? parsed.filename ?? parsed.pattern ?? parsed.query ?? parsed.url;
      if (typeof hint === "string") {
        const short = hint.length > 60 ? hint.slice(0, 57) + "..." : hint;
        summary = `${msg.toolName}  ${short}`;
      }
    } catch { }
  }
  return { summary, detail: msg.toolOutput ?? null };
}

export default function ToolBubble({ msg }: { msg: ToolChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const { summary, detail } = parseToolParts(msg);

  return (
    <div className="flex flex-col items-center mb-3 w-full px-4">
      <div className="w-full max-w-[90%] border border-slate-700/50 bg-[#0a0f1c] p-2 relative group overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-600 group-hover:bg-cyan-500 transition-colors" />

        <div className="flex justify-between items-start gap-4 pl-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 bg-slate-800 px-1 py-0.5">
              SYS_TOOL
            </span>
            <span className="text-[10px] font-bold text-cyan-500/80 font-mono truncate">
              {summary}
            </span>
          </div>
          {detail && (
            <button
              type="button"
              className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors bg-slate-800/50 hover:bg-slate-800 px-2 py-1"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "HIDE_LOG" : "VIEW_LOG"}
            </button>
          )}
        </div>

        {expanded && detail && (
          <div className="mt-2 pl-2 border-t border-slate-800/50 pt-2">
            <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap overflow-x-auto custom-scrollbar max-h-[200px]">
              {detail}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
