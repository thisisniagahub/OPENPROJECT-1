"use client";

import { useEffect, useRef, useState } from "react";
import type * as PhaserTypes from "phaser";

interface GameError {
  message: string;
  stack?: string;
  timestamp: string;
}

export default function PhaserGame() {
  const gameRef = useRef<PhaserTypes.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<GameError | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function initGame() {
      if (!containerRef.current) {
        console.log("[PhaserGame] No container ref");
        return;
      }

      try {
        console.log("[PhaserGame] Starting initialization...");

        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }

        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        setError(null);
        setLoading(true);
        setLoadingProgress(10);

        // Dynamic import of game config
        const configModule = await import("./config");
        const gameConfig = configModule.gameConfig;

        if (!mounted) {
          console.log("[PhaserGame] Unmounted during config load");
          return;
        }
        setLoadingProgress(30);

        // Dynamic import of Phaser
        const Phaser = await import("phaser");

        if (!mounted) {
          console.log("[PhaserGame] Unmounted during Phaser load");
          return;
        }
        setLoadingProgress(50);

        // Create game
        console.log("[PhaserGame] Creating game...");
        const game = new Phaser.Game({
          ...gameConfig,
          parent: containerRef.current,
        });

        setLoadingProgress(80);
        gameRef.current = game;
        console.log("[PhaserGame] Game created");

        // Handle ready event
        game.events.once("ready", () => {
          console.log("[PhaserGame] Game ready");
          if (mounted) {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            setLoadingProgress(100);
            setLoading(false);
          }
        });

        // Handle errors
        game.events.on("error", (err: Error) => {
          console.error("[PhaserGame] Game error:", err);
          if (mounted) {
            setError({
              message: err.message || "Game error",
              stack: err.stack,
              timestamp: new Date().toISOString(),
            });
            setLoading(false);
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
          }
        });

        // Timeout for loading
        loadingTimeoutRef.current = setTimeout(() => {
          if (mounted && loading) {
            console.log("[PhaserGame] Timeout - forcing ready");
            setLoadingProgress(100);
            setLoading(false);
          }
        }, 12000);

      } catch (err) {
        console.error("[PhaserGame] Init error:", err);
        if (mounted) {
          const error = err as Error;
          setError({
            message: error.message || "Failed to initialize game",
            stack: error.stack,
            timestamp: new Date().toISOString(),
          });
          setLoading(false);
        }
      }
    }

    initGame();

    return () => {
      console.log("[PhaserGame] Cleanup");
      mounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
          console.log("[PhaserGame] Game destroyed");
        } catch (e) {
          console.log("[PhaserGame] Destroy error:", e);
        }
        gameRef.current = null;
      }
    };
  }, [resetKey]);

  // Game container
  return (
    <div className="relative w-full h-full bg-cyber-background overflow-hidden border-mask">
      {/* FRAME OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] opacity-20" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />
      </div>

      {/* Game Container */}
      <div
        id="phaser-game-container"
        ref={containerRef}
        className="w-full h-full transition-opacity duration-1000"
      />


      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-8 text-center">
          <div className="max-w-md modern-glass p-12 border-cyber-accent-red/30 diagonal-cut">
            <div className="text-5xl mb-8 animate-pulse text-cyber-accent-red drop-shadow-[0_0_15px_rgba(255,0,60,0.5)]">!</div>
            <div className="text-cyber-accent-red font-cyber-display font-bold mb-6 uppercase tracking-[0.3em] text-[12px]">Neural_Link_Failure</div>
            <div className="text-cyber-muted font-cyber-mono text-[10px] leading-relaxed mb-10 opacity-80">{error.message}</div>
            <button
              onClick={() => {
                setLoading(true);
                setLoadingProgress(0);
                setResetKey((value) => value + 1);
              }}
              className="px-10 py-3 bg-cyber-accent-red/10 border border-cyber-accent-red/50 text-cyber-accent-red hover:bg-cyber-accent-red hover:text-white transition-all duration-300 uppercase font-cyber-display font-bold text-[11px] tracking-[0.2em] diagonal-cut"
            >
              Force_Re-Sync
            </button>
          </div>
        </div>
      )}


      {/* Loading Overlay */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-background z-40 gap-10">
          <div className="relative">
            <div className="w-32 h-32 border-[2px] border-cyber-muted/20 border-t-cyber-primary rounded-full animate-spin transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center text-[12px] font-cyber-mono font-bold text-cyber-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              {loadingProgress}%
            </div>
            {/* Pulsing inner ring */}
            <div className="absolute inset-4 border-[1px] border-cyber-accent-purple/30 rounded-full animate-pulse" />
          </div>
          <div className="text-center group">
            <div className="text-cyber-text font-cyber-display font-bold uppercase tracking-[0.4em] text-[12px] mb-3">Establishing_Neural_Sync</div>
            <div className="text-cyber-primary/40 font-cyber-mono text-[9px] animate-pulse uppercase tracking-[0.2em]">
              ORBITAL_STREAM_ENCRYPTING...
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

