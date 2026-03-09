"use client";

import dynamic from "next/dynamic";
import { useState, Suspense } from "react";
import { StudioProvider } from "@/lib/store";
import GameHud from "@/components/hud/GameHud";
import KeyboardHelp from "@/components/hud/KeyboardHelp";
import { Gamepad2, Edit3, Keyboard } from "lucide-react";

// Dynamically import PhaserGame to avoid SSR issues
const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading Agent Town...</p>
      </div>
    </div>
  ),
});

// Editor component placeholder
const OfficeEditor = dynamic(() => import("@/components/editor/OfficeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading Editor...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [mode, setMode] = useState<"play" | "edit">("play");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <StudioProvider>
      <main className="h-screen w-screen overflow-hidden bg-slate-950">
        {/* Mode Toggle */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          <div className="flex bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setMode("play")}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
                mode === "play"
                  ? "bg-yellow-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Gamepad2 size={16} />
              Play
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
                mode === "edit"
                  ? "bg-purple-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Edit3 size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <h1 className="text-xl font-bold text-yellow-500 pixel-font">
            Agent Town
          </h1>
          <p className="text-xs text-slate-400 text-center">
            OpenClaw AI Agent Workspace
          </p>
        </div>

        {/* Help Button */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="absolute top-4 right-[340px] z-50 p-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
          title="Keyboard shortcuts"
        >
          <Keyboard size={16} className="text-slate-400" />
        </button>

        {/* Game Canvas or Editor - Full Screen */}
        <div className="absolute inset-0">
          <Suspense fallback={<div className="h-full bg-slate-900" />}>
            {mode === "play" ? <PhaserGame /> : <OfficeEditor />}
          </Suspense>
        </div>

        {/* HUD Overlay - Game UI */}
        {mode === "play" && <GameHud />}

        {/* Editor HUD */}
        {mode === "edit" && (
          <div className="absolute top-4 right-4 z-40 pixel-panel p-4 w-80">
            <h3 className="text-sm font-bold text-purple-400 pixel-font mb-3">
              Office Editor
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Design your office layout with the canvas below.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <p>• Click and drag to pan</p>
              <p>• Scroll to zoom</p>
              <p>• Use toolbar to place furniture</p>
              <p>• Press Undo/Redo for history</p>
            </div>
          </div>
        )}

        {/* Keyboard Help Overlay */}
        <KeyboardHelp />

        {/* Watermark */}
        <div className="absolute bottom-2 left-2 z-50 pointer-events-none">
          <p className="text-xs text-slate-600 font-mono">
            Agent Town + Pixel Agents | Powered by OpenClaw
          </p>
        </div>

        {/* Mode Indicator */}
        <div className="absolute bottom-2 right-2 z-50">
          <span
            className={`px-2 py-1 rounded text-xs font-mono ${
              mode === "play"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-purple-500/20 text-purple-500"
            }`}
          >
            {mode === "play" ? "🎮 Play Mode" : "✏️ Edit Mode"}
          </span>
        </div>
      </main>
    </StudioProvider>
  );
}
