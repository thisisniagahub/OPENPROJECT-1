"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { useStudio } from "@/lib/store";
import type { ChatMessage, SessionRecord, TaskItem } from "@/types/game";
import MessageBubble from "./MessageBubble";
import SessionSwitcher from "./SessionSwitcher";

export default function ChatPanel({
  messages,
  tasks,
  isConnected,
  sessions,
  activeSessionKey,
  showComposer = true,
}: {
  messages: ChatMessage[];
  tasks: TaskItem[];
  isConnected: boolean;
  sessions: SessionRecord[];
  activeSessionKey?: string;
  showComposer?: boolean;
}) {
  const { assignTask } = useStudio();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const actorByRunId = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      if (!task.actorName) continue;
      if (task.runId) map.set(task.runId, task.actorName);
      map.set(task.taskId, task.actorName);
    }
    return map;
  }, [tasks]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !isConnected) return;
    assignTask(trimmed);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="modern-glass flex flex-col h-full pointer-events-auto border-cyber-muted/30 relative">
      {/* HEADER */}
      <div className="flex-none px-5 py-3 border-b border-cyber-primary/20 bg-cyber-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyber-primary shadow-[0_0_8px_var(--cyber-primary)] animate-pulse" />
          <h2 className="text-[12px] font-cyber-display font-bold text-cyber-primary tracking-[0.2em] uppercase">NEURAL TERMINAL</h2>
        </div>
        <SessionSwitcher sessions={sessions} activeKey={activeSessionKey} />
      </div>
      <div className="flex-none px-5 py-2 bg-black/40 border-b border-cyber-muted/10 flex justify-between items-center text-[10px] font-cyber-mono font-medium text-cyber-muted/60 uppercase tracking-[0.1em]">
        <span>LINK: {isConnected ? <span className="text-cyber-primary">SECURE</span> : <span className="text-cyber-accent-red">DORMANT</span>}</span>
        <span>STREAM: {messages.length} PKTS</span>
      </div>

      {/* BODY - CHAT MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 uppercase tracking-[0.3em] font-cyber-display font-bold text-[11px] text-cyber-primary">
            <div className="w-3 h-3 bg-cyber-primary mb-4 animate-ping" />
            AWAITING DATA STREAM...
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              msg={message}
              actorName={actorByRunId.get(message.runId)}
            />
          ))
        )}
      </div>

      {showComposer ? (
        <div className="flex-none p-3 border-t border-cyber-primary/20 bg-cyber-background/50">
          <div className="relative flex items-center group modern-glass border-cyber-muted/20">
            <div className="absolute left-4 text-cyber-primary font-bold text-[14px] animate-pulse pointer-events-none font-cyber-mono">
              {">"}
            </div>
            <textarea
              ref={inputRef}
              className="w-full bg-transparent border-none px-10 py-4 text-[13px] font-cyber-mono font-medium text-cyber-primary placeholder:text-cyber-muted/30 focus:outline-none focus:ring-0 transition-all resize-none min-h-[56px] max-h-[150px] custom-scrollbar"
              placeholder={isConnected ? "TRANSMIT NEURAL_OVERRIDE_..." : "UPLINK REQUIRED FOR INJECTION..."}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
            />
            <button
              type="button"
              title="TRANSMIT DATA"
              className={`absolute right-3 px-4 flex items-center justify-center transition-all h-[36px] border diagonal-cut ${!isConnected || !input.trim()
                ? "bg-transparent text-cyber-muted/30 border-cyber-muted/10 cursor-not-allowed"
                : "bg-cyber-primary/10 text-cyber-primary border-cyber-primary/50 hover:bg-cyber-primary hover:text-cyber-background shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                }`}
              onClick={handleSend}
              disabled={!isConnected || !input.trim()}
            >
              <span className="text-[10px] font-cyber-display font-bold tracking-[0.1em] uppercase">EXECUTE</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
