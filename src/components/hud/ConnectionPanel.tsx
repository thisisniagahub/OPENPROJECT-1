"use client";

import { useState, useEffect } from "react";
import { useStudio } from "@/lib/store";
import { LS_CONFIG, STATUS_LABELS } from "@/lib/constants";
import { getGatewayUrl } from "@/lib/env";
import { parseGatewayAddress } from "@/lib/utils";
import { Activity, Wifi, WifiOff } from "lucide-react";

const DEFAULT_GATEWAY = getGatewayUrl();
const DEFAULT_TOKEN = "";

export default function ConnectionPanel() {
  const { state, connect, disconnect } = useStudio();
  const [url, setUrl] = useState(DEFAULT_GATEWAY);
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [restoredUrlOnly, setRestoredUrlOnly] = useState(false);
  const [restoredRequiresToken, setRestoredRequiresToken] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw) as { url?: string; requiresToken?: boolean };
        if (parsed.url) {
          setUrl(parsed.url);
          setRestoredUrlOnly(true);
          setRestoredRequiresToken(Boolean(parsed.requiresToken));
        }
      }
    } catch { }
  }, []);

  const isConnected = state.connection === "connected";
  const isConnecting =
    state.connection === "connecting" || state.connection === "handshaking";
  const isAuthFailed = state.connection === "auth_failed";
  const isUnreachable = state.connection === "unreachable";
  const isRateLimited = state.connection === "rate_limited";

  const [error, setError] = useState("");

  const handleConnect = () => {
    setError("");
    const parsed = parseGatewayAddress(url);
    if (!parsed) {
      setError("INVALID URL FORMAT");
      return;
    }
    connect({ url: parsed, token: token.trim() });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      handleConnect();
    }
  };

  return (
    <div className="modern-glass flex flex-col pointer-events-auto border-cyber-muted/30 diagonal-cut">
      {/* HEADER */}
      <div className="flex-none px-5 py-3 border-b border-cyber-primary/20 bg-cyber-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConnected ? <Activity size={14} className="text-green-400 animate-pulse" /> : <Wifi size={14} className="text-cyber-primary" />}
          <h2 className="text-[12px] font-cyber-display font-bold text-cyber-primary tracking-[0.2em] uppercase">SYSTEM UPLINK</h2>
        </div>
        <div className={`text-[9px] font-cyber-mono font-bold uppercase tracking-[0.1em] px-2 py-0.5 border ${isConnected ? "bg-green-500/10 text-green-400 border-green-500/30" :
          isConnecting ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" :
            isAuthFailed || isUnreachable ? "bg-cyber-accent-red/10 text-cyber-accent-red border-cyber-accent-red/30" :
              "bg-cyber-muted/10 text-cyber-muted border-cyber-muted/20"
          }`}>
          {STATUS_LABELS[state.connection]}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-5">
        <div className="space-y-2">
          <label className="text-[9px] font-cyber-display font-bold text-cyber-muted uppercase tracking-[0.2em] flex justify-between">
            <span>Gateway Protocol</span>
            {url !== DEFAULT_GATEWAY && <span className="text-cyber-primary/40">SECURE_CUSTOM_ROUTE</span>}
          </label>
          <input
            className="w-full bg-black/40 border border-cyber-muted/20 focus:border-cyber-primary/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] text-cyber-primary font-cyber-mono font-bold px-4 py-2.5 text-[11px] outline-none transition-all placeholder:text-cyber-muted/30"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
              setRestoredUrlOnly(false);
              setRestoredRequiresToken(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="ws://127.0.0.1:18789"
            disabled={isConnected || isConnecting}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-cyber-display font-bold text-cyber-muted uppercase tracking-[0.2em]">
            Authorization Cryptic
          </label>
          <input
            className="w-full bg-black/40 border border-cyber-muted/20 focus:border-cyber-primary/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] text-cyber-accent-purple font-cyber-mono font-bold px-4 py-2.5 text-[11px] outline-none transition-all placeholder:text-cyber-muted/30"
            type="password"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setError("");
              setRestoredUrlOnly(false);
              setRestoredRequiresToken(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="[KEYSTORE_ACCESS_REQUIRED]"
            disabled={isConnected || isConnecting}
          />
        </div>

        {/* STATUS MESSAGES */}
        <div className="min-h-[20px]">
          {restoredUrlOnly && restoredRequiresToken && !token && !isConnected && !isConnecting && (
            <p className="text-cyan-500/80 text-[8px] uppercase tracking-widest font-bold">
              {"< RE-ENTER RUNTIME TOKEN TO PROCEED >"}
            </p>
          )}
          {isAuthFailed && !error && (
            <p className="text-red-400 text-[8px] uppercase tracking-widest font-bold">
              {"[ERROR] UNAUTHORIZED / TOKEN INVALID"}
            </p>
          )}
          {isUnreachable && !error && (
            <p className="text-red-400 text-[8px] uppercase tracking-widest font-bold">
              {"[ERROR] GATEWAY UNREACHABLE / OFFLINE"}
            </p>
          )}
          {isRateLimited && !error && (
            <p className="text-yellow-400 text-[8px] uppercase tracking-widest font-bold">
              {"[WARN] RATE LIMIT DETECTED. STAND BY."}
            </p>
          )}
          {error && (
            <p className="text-red-400 text-[8px] uppercase tracking-widest font-bold">
              {`[SYSERR] ${error}`}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end pt-5 border-t border-cyber-muted/10">
          {!isConnected && !isConnecting && (
            <button
              type="button"
              className="bg-cyber-primary/10 border border-cyber-primary/40 text-cyber-primary hover:bg-cyber-primary hover:text-cyber-background font-cyber-display font-bold uppercase tracking-[0.2em] text-[11px] w-full py-3 transition-all duration-300 disabled:opacity-30 diagonal-cut"
              onClick={handleConnect}
              disabled={!url.trim()}
            >
              INITIALIZE SYNC
            </button>
          )}
          {isConnected && (
            <button
              type="button"
              className="bg-cyber-accent-red/10 border border-cyber-accent-red/40 text-cyber-accent-red hover:bg-cyber-accent-red hover:text-white font-cyber-display font-bold uppercase tracking-[0.2em] text-[11px] w-full py-3 transition-all duration-300 diagonal-cut"
              onClick={disconnect}
            >
              TERMINATE LINK
            </button>
          )}
          {isConnecting && (
            <button
              type="button"
              className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-black font-cyber-display font-bold uppercase tracking-[0.2em] text-[11px] w-full py-3 transition-all animate-pulse diagonal-cut"
              onClick={disconnect}
            >
              SHAKING HANDS...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
