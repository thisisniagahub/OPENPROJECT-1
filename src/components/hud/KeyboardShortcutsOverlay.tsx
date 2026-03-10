"use client";

import { useEffect, useState } from "react";
import { X, Gamepad2, Edit, Save, Plus, Wifi, Settings, Keyboard } from "lucide-react";

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  label: string;
  icon?: React.ReactNode;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: "?", label: "Show shortcuts", category: "Navigation" },
  { key: "Esc", label: "Close panel", category: "Navigation" },
  { key: "1", label: "Toggle agent registry", category: "Navigation" },
  { key: "2", label: "Toggle operations log", category: "Navigation" },
  { key: "3", label: "Toggle command terminal", category: "Navigation" },
  { key: "4", label: "Toggle active core", category: "Navigation" },
  { key: "5", label: "Toggle system config", category: "Navigation" },

  // Modes
  { key: "E", label: "Edit mode", icon: <Edit className="w-3 h-3 text-cyan-500" />, category: "Modes" },
  { key: "P", label: "Play mode", icon: <Gamepad2 className="w-3 h-3 text-cyan-500" />, category: "Modes" },

  // Actions
  { key: "Ctrl+S", label: "Save layout", icon: <Save className="w-3 h-3 text-cyan-500" />, category: "Actions" },
  { key: "N", label: "New session", icon: <Plus className="w-3 h-3 text-cyan-500" />, category: "Actions" },
  { key: "C", label: "Connect/Disconnect", icon: <Wifi className="w-3 h-3 text-cyan-500" />, category: "Actions" },
  { key: ",", label: "Open config", icon: <Settings className="w-3 h-3 text-cyan-500" />, category: "Actions" },

  // Game
  { key: "WASD", label: "Move camera", category: "Game" },
  { key: "+/-", label: "Zoom in/out", category: "Game" },
  { key: "Space", label: "Pause/Resume", category: "Game" },
];

export default function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02050a]/90 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-[#050a15] border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,240,255,0.2)] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b-2 border-cyan-500/50 bg-[#0a0f1c]">
          <div className="absolute top-0 left-0 w-2 h-2 border-r border-b border-cyan-400" />
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <h2 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">
              Key Bindings
            </h2>
          </div>
          <button
            onClick={onClose}
            title="Close shortcuts"
            className="p-1 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors z-10"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="relative z-10 p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-[9px] font-black text-cyan-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500" /> {category}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2 px-3 border border-cyan-900 bg-[#02050a] hover:bg-[#0a0f1c] hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && <div className="p-1 bg-cyan-900/30 border border-cyan-900/50">{shortcut.icon}</div>}
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {shortcut.label}
                      </span>
                    </div>
                    <kbd className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/40 text-[10px] text-cyan-400 font-mono tracking-widest shadow-[0_0_5px_rgba(0,240,255,0.2)]">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 px-4 py-3 border-t border-cyan-500/30 bg-[#0a0f1c]">
          <p className="text-[8px] font-black text-cyan-700 text-center uppercase tracking-widest">
            PRESS <kbd className="px-1.5 py-0.5 bg-cyan-900 text-cyan-400 mx-1">?</kbd> TO TOGGLE ASSISTANCE PROTOCOL
          </p>
        </div>
      </div>
    </div>
  );
}

// Custom hook for keyboard shortcuts
export function useKeyboardShortcuts(callbacks: {
  onToggleShortcuts?: () => void;
  onToggleEditMode?: () => void;
  onTogglePlayMode?: () => void;
  onSave?: () => void;
  onNewSession?: () => void;
  onConnect?: () => void;
  onSettings?: () => void;
  onTogglePanel?: (index: number) => void;
}) {
  const [activePanel, setActivePanel] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "?":
          e.preventDefault();
          callbacks.onToggleShortcuts?.();
          break;
        case "e":
          e.preventDefault();
          callbacks.onToggleEditMode?.();
          break;
        case "p":
          e.preventDefault();
          callbacks.onTogglePlayMode?.();
          break;
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            callbacks.onSave?.();
          }
          break;
        case "n":
          e.preventDefault();
          callbacks.onNewSession?.();
          break;
        case "c":
          e.preventDefault();
          callbacks.onConnect?.();
          break;
        case ",":
          e.preventDefault();
          callbacks.onSettings?.();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          e.preventDefault();
          const panelIndex = parseInt(key);
          callbacks.onTogglePanel?.(panelIndex);
          setActivePanel(activePanel === panelIndex ? null : panelIndex);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks, activePanel]);

  return activePanel;
}
