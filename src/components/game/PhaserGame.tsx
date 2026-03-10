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
  const [error, setError] = useState<GameError | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function initGame() {
      if (!containerRef.current) {
        console.log("[PhaserGame] No container ref");
        return;
      }

      try {
        console.log("[PhaserGame] Starting initialization...");
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
          }
        });

        // Timeout - force ready after 8 seconds
        const timeoutId = setTimeout(() => {
          console.log("[PhaserGame] Timeout - forcing ready");
          if (mounted && loading) {
            setLoadingProgress(100);
            setLoading(false);
          }
        }, 8000);

        // Cleanup timeout on unmount
        return () => {
          clearTimeout(timeoutId);
        };

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

    const timeoutCleanup = initGame();

    return () => {
      console.log("[PhaserGame] Cleanup");
      mounted = false;
      
      // Cleanup timeout
      timeoutCleanup?.then?.((cleanup) => cleanup?.());
      
      // Destroy game
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
  }, []);

  // Error state
  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#ef4444",
          fontFamily: '"Press Start 2P", monospace',
          padding: 32,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 48, marginBottom: 24 }}>⚠️</div>
          <div style={{ fontSize: 14, marginBottom: 16, color: "#facc15" }}>
            Game Error
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 10,
              maxWidth: 400,
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            {error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px",
              border: "3px solid #facc15",
              background: "transparent",
              color: "#facc15",
              fontFamily: "inherit",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 80,
              height: 80,
              border: "4px solid #2a2a4a",
              borderTopColor: "#facc15",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 12,
              color: "#facc15",
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            {loadingProgress}%
          </div>
        </div>
        <div
          style={{
            color: "#e2e8f0",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 8 }}>Loading Agent Town</div>
          <div style={{ color: "#64748b", fontSize: 8 }}>
            Initializing game engine...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Game container
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
      }}
    />
  );
}
