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
  { key: "1", label: "Toggle agent status", category: "Navigation" },
  { key: "2", label: "Toggle task history", category: "Navigation" },
  { key: "3", label: "Toggle chat panel", category: "Navigation" },
  { key: "4", label: "Toggle model selector", category: "Navigation" },
  { key: "5", label: "Toggle terminal", category: "Navigation" },

  // Modes
  { key: "E", label: "Edit mode", icon: <Edit className="w-3 h-3" />, category: "Modes" },
  { key: "P", label: "Play mode", icon: <Gamepad2 className="w-3 h-3" />, category: "Modes" },

  // Actions
  { key: "Ctrl+S", label: "Save layout", icon: <Save className="w-3 h-3" />, category: "Actions" },
  { key: "N", label: "New session", icon: <Plus className="w-3 h-3" />, category: "Actions" },
  { key: "C", label: "Connect/Disconnect", icon: <Wifi className="w-3 h-3" />, category: "Actions" },
  { key: ",", label: "Open settings", icon: <Settings className="w-3 h-3" />, category: "Actions" },

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-xs text-slate-400 mb-2 uppercase tracking-wider" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                {category}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {shortcut.icon}
                      <span className="text-xs text-slate-300" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                        {shortcut.label}
                      </span>
                    </div>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-white">?</kbd> to toggle this overlay
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
