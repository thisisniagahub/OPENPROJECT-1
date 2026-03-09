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
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setLoadingProgress(10);

        const { gameConfig } = await import("./config");
        if (!mounted) return;
        setLoadingProgress(30);

        const Phaser = await import("phaser");
        if (!mounted) return;
        setLoadingProgress(50);

        const game = new Phaser.Game({
          ...gameConfig,
          parent: containerRef.current,
        });
        
        setLoadingProgress(80);
        gameRef.current = game;

        // Wait for game to be ready
        game.events.once("ready", () => {
          if (mounted) {
            setLoadingProgress(100);
            setLoading(false);
          }
        });

        // Handle game errors
        game.events.on("error", (err: Error) => {
          if (mounted) {
            setError({
              message: err.message || "Game initialization failed",
              stack: err.stack,
              timestamp: new Date().toISOString(),
            });
            setLoading(false);
          }
        });

        // Timeout for loading
        const timeout = setTimeout(() => {
          if (mounted && loading) {
            setLoading(false);
          }
        }, 10000);

        return () => clearTimeout(timeout);

      } catch (err) {
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
      mounted = false;
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch {
          // Ignore destroy errors
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
            onClick={() => {
              setError(null);
              setLoading(true);
              setLoadingProgress(0);
            }}
            style={{
              padding: "12px 32px",
              border: "3px solid #facc15",
              background: "transparent",
              color: "#facc15",
              fontFamily: "inherit",
              fontSize: 10,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#facc15";
              e.currentTarget.style.color = "#1a1a2e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#facc15";
            }}
          >
            Retry
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

  return (
    <div
      ref={containerRef}
      style={{
        width: "calc(100% - 320px)",
        height: "100%",
        imageRendering: "pixelated",
      }}
    />
  );
}
