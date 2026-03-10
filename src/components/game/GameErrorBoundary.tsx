"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface GameErrorBoundaryProps {
  children: ReactNode;
}

interface GameErrorBoundaryState {
  error: Error | null;
  resetCount: number;
}

export default class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  state: GameErrorBoundaryState = {
    error: null,
    resetCount: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<GameErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[GameErrorBoundary] Phaser render crash:", error, errorInfo);
  }

  private handleRestart = () => {
    this.setState((currentState) => ({
      error: null,
      resetCount: currentState.resetCount + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-6">
          <div className="pixel-panel w-full max-w-xl border border-red-500/50 bg-slate-950/90 p-6 text-left shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-red-400">
              Phaser Recovery Mode
            </div>
            <h2 className="mb-3 text-xl font-black uppercase tracking-tight text-white">
              Game Renderer Crashed
            </h2>
            <p className="mb-5 text-sm text-slate-300">
              Agent Town hit a client-side rendering failure. You can restart the game surface
              without leaving the operator session.
            </p>
            <div className="mb-5 rounded border border-slate-800 bg-black/40 p-3 font-mono text-xs text-slate-400">
              {this.state.error.message || "Unknown Phaser error"}
            </div>
            <button
              type="button"
              onClick={this.handleRestart}
              className="pixel-button border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 transition-colors hover:bg-cyan-500 hover:text-black"
            >
              Restart Game
            </button>
          </div>
        </div>
      );
    }

    return <div key={this.state.resetCount} className="h-full w-full">{this.props.children}</div>;
  }
}
