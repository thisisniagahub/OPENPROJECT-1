"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStudio } from "@/lib/store";
import { saveOnboardingDone } from "@/lib/persistence";

interface Props {
  onDone: () => void;
}

export default function OnboardingOverlay({ onDone }: Props) {
  const { state } = useStudio();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  const finish = useCallback(() => {
    saveOnboardingDone();
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (state.connection === "connected") {
      const t = setTimeout(finish, 800);
      return () => clearTimeout(t);
    }
  }, [state.connection, finish]);

  useEffect(() => {
    function track() {
      const el = document.querySelector<HTMLElement>('[data-dock-id="connection"]');
      if (el) {
        const r = el.getBoundingClientRect();
        setRect((prev) => {
          if (!prev || Math.abs(prev.x - r.x) > 1 || Math.abs(prev.y - r.y) > 1 ||
            Math.abs(prev.width - r.width) > 1) {
            return r;
          }
          return prev;
        });
      }
      rafRef.current = requestAnimationFrame(track);
    }
    rafRef.current = requestAnimationFrame(track);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!rect) return null;

  const pad = 6;
  const spotX = rect.left - pad;
  const spotY = rect.top - pad;
  const spotW = rect.width + pad * 2;
  const spotH = rect.height + pad * 2;

  const tooltipW = 280;
  const tooltipX = spotX + spotW / 2 - tooltipW / 2;
  const tooltipY = spotY - 80;

  // We use CSS variables to avoid inline style warnings for dynamic positioning
  const overlayVars = {
    "--spot-x": `${spotX}px`,
    "--spot-y": `${spotY}px`,
    "--spot-w": `${spotW}px`,
    "--spot-h": `${spotH}px`,
    "--clip-path": `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${spotX}px ${spotY}px, ${spotX}px ${spotY + spotH}px, ${spotX + spotW}px ${spotY + spotH}px, ${spotX + spotW}px ${spotY}px, ${spotX}px ${spotY}px)`,
    "--tooltip-x": `${tooltipX}px`,
    "--tooltip-y": `${tooltipY}px`,
    "--tooltip-w": `${tooltipW}px`,
  } as React.CSSProperties;

  return (
    <div style={overlayVars} className="onboarding-container font-cyber-display">
      {/* Dark overlay with cutout */}
      <div
        className="onboarding-overlay bg-black/40 backdrop-blur-[2px]"
        onClick={finish}
      />

      {/* Pulsing ring around the connection dock button */}
      <div className="onboarding-spotlight border-cyber-primary shadow-[0_0_20px_rgba(0,240,255,0.4)]">
        <div className="corner corner-tl border-cyber-primary" />
        <div className="corner corner-br border-cyber-primary" />
      </div>

      {/* Tooltip */}
      <div className="onboarding-tooltip modern-glass border-cyber-primary/40 diagonal-cut shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="tooltip-accent-corner border-cyber-primary" />
        <div className="tooltip-pulse-dot bg-cyber-primary shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
        <h3 className="tooltip-title text-cyber-primary font-bold tracking-[0.2em] uppercase">
          ACTION_REQUIRED: Establish_Neural_Link
        </h3>
        <p className="tooltip-text text-white/80 font-cyber-mono font-bold leading-relaxed">
          Initialize the <span className="text-cyber-primary">GATEWAY</span> connection protocol to transmit tactical instructions to operatives in the field.
        </p>

        {/* Arrow pointers */}
        <div className="tooltip-arrow-outer border-b-cyber-primary/40" />
        <div className="tooltip-arrow-inner border-b-black/80" />
      </div>

      {/* Skip text */}
      <div className="onboarding-skip">
        <button
          type="button"
          onClick={finish}
          className="px-6 py-2 bg-black/40 border border-cyber-primary/20 text-cyber-primary/40 hover:text-cyber-primary hover:border-cyber-primary transition-all duration-300 font-cyber-mono font-bold tracking-[0.3em] diagonal-cut"
        >
          {">>> OVERRIDE_BYPASS <<<"}
        </button>
      </div>
    </div>
  );
}
