"use client";

import type { ChatMessage } from "@/types/game";
import ToolBubble from "./ToolBubble";

export default function MessageBubble({ msg, actorName }: { msg: ChatMessage; actorName?: string }) {
  if (msg.role === "system") {
    return (
      <div className="flex items-start gap-2 mb-2 p-2 border border-yellow-500/30 bg-yellow-500/10">
        <span className="text-yellow-500 font-black animate-pulse">{">"}</span>
        <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "tool") {
    return <ToolBubble msg={msg} />;
  }

  const isUser = msg.role === "user";

  return (
    <div className={`flex flex-col mb-3 ${isUser ? "pl-8 items-end" : "pr-8 items-start"}`}>
      <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isUser ? "text-cyan-600" : "text-magenta-500"}`}>
        {isUser ? "OP_CMD" : msg.actorName ?? actorName ?? "AGENT_SYS"}
      </div>
      <div
        className={`p-3 relative group border ${isUser
            ? "bg-cyan-900/10 border-cyan-500/30 text-cyan-50"
            : "bg-magenta-900/10 border-magenta-500/30 text-magenta-50"
          }`}
      >
        {/* Accent Bar */}
        <div className={`absolute top-0 bottom-0 w-1 ${isUser ? "right-0 bg-cyan-500" : "left-0 bg-magenta-500"
          }`} />

        <div className="text-[11px] font-bold leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
          {msg.content}
          {msg.streaming && <span className="inline-block w-2.5 h-3.5 bg-cyan-400 ml-1 animate-pulse" />}
        </div>
      </div>
    </div>
  );
}
