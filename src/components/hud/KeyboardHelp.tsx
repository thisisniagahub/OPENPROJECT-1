"use client";

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutItem {
  key: string;
  description: string;
  category: string;
}

const SHORTCUTS: ShortcutItem[] = [
  // Movement
  { key: "W / ↑", description: "Move up", category: "Movement" },
  { key: "S / ↓", description: "Move down", category: "Movement" },
  { key: "A / ←", description: "Move left", category: "Movement" },
  { key: "D / →", description: "Move right", category: "Movement" },
  { key: "E", description: "Interact with worker", category: "Movement" },
  
  // Camera
  { key: "Scroll", description: "Zoom in/out", category: "Camera" },
  { key: "Drag", description: "Pan camera", category: "Camera" },
  
  // UI
  { key: "?", description: "Show this help", category: "UI" },
  { key: "Esc", description: "Close panels", category: "UI" },
  
  // Chat
  { key: "Enter", description: "Send message", category: "Chat" },
  { key: "Shift + Enter", description: "New line in chat", category: "Chat" },
];

export default function KeyboardHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle with ? key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement?.tagName !== "INPUT" && 
            document.activeElement?.tagName !== "TEXTAREA") {
          setIsOpen((prev) => !prev);
        }
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 z-40 p-2 bg-slate-800/80 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={16} className="text-slate-400" />
      </button>
    );
  }

  // Group shortcuts by category
  const grouped = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="pixel-panel max-w-md w-full mx-4 p-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-yellow-500 pixel-font flex items-center gap-2">
            <Keyboard size={14} />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category}>
              <div className="text-xs text-slate-400 mb-2 font-medium">
                {category}
              </div>
              <div className="space-y-1">
                {shortcuts.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-yellow-500 font-mono text-[10px]">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-[10px] text-slate-500 text-center">
            Press <kbd className="px-1 bg-slate-700 rounded">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}
