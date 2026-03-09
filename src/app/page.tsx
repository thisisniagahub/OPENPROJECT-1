"use client";

import dynamic from "next/dynamic";
import { StudioProvider } from "@/lib/store";
import GameHud from "@/components/hud/GameHud";

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

export default function Home() {
  return (
    <StudioProvider>
      <main className="h-screen w-screen overflow-hidden bg-slate-950">
        {/* Game Canvas - Full Screen */}
        <div className="absolute inset-0">
          <PhaserGame />
        </div>

        {/* HUD Overlay - Game UI */}
        <GameHud />

        {/* Watermark */}
        <div className="absolute bottom-2 left-2 z-50 pointer-events-none">
          <p className="text-xs text-slate-600 font-mono">
            Agent Town + Pixel Agents | Powered by OpenClaw
          </p>
        </div>
      </main>
    </StudioProvider>
  );
}
