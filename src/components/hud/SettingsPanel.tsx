"use client";

import { useState, useEffect } from "react";
import { X, Moon, Sun, Monitor, Volume2, VolumeX, Music, Bug, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [gatewayToken, setGatewayToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedUrl = localStorage.getItem("agent-town:gateway-config");
    if (savedUrl) {
      try {
        const config = JSON.parse(savedUrl);
        setGatewayUrl(config.url || "");
        setGatewayToken(config.token || "");
      } catch {
        // Ignore
      }
    }

    const soundSetting = localStorage.getItem("agent-town:sound-enabled");
    setSoundEnabled(soundSetting !== "false");

    const musicSetting = localStorage.getItem("agent-town:music-enabled");
    setMusicEnabled(musicSetting !== "false");

    const debugSetting = localStorage.getItem("agent-town:debug-mode");
    setDebugMode(debugSetting === "true");
  }, []);

  const handleSaveGateway = () => {
    localStorage.setItem("agent-town:gateway-config", JSON.stringify({
      url: gatewayUrl,
      token: gatewayToken,
    }));
  };

  const handleToggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("agent-town:sound-enabled", String(newValue));
  };

  const handleToggleMusic = () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    localStorage.setItem("agent-town:music-enabled", String(newValue));
  };

  const handleToggleDebug = () => {
    const newValue = !debugMode;
    setDebugMode(newValue);
    localStorage.setItem("agent-town:debug-mode", String(newValue));
  };

  const handleResetDefaults = () => {
    setGatewayUrl("ws://127.0.0.1:18789");
    setGatewayToken("");
    setSoundEnabled(true);
    setMusicEnabled(true);
    setDebugMode(false);
    setTheme("dark");

    localStorage.setItem("agent-town:gateway-config", JSON.stringify({
      url: "ws://127.0.0.1:18789",
      token: "",
    }));
    localStorage.setItem("agent-town:sound-enabled", "true");
    localStorage.setItem("agent-town:music-enabled", "true");
    localStorage.setItem("agent-town:debug-mode", "false");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md mx-4 modern-glass border-cyber-primary/30 flex flex-col diagonal-cut transition-all duration-500">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-cyber-primary/20 bg-black/40">
          <div className="absolute top-0 left-0 w-3 h-3 border-r-2 border-b-2 border-cyber-primary/40" />
          <h2 className="text-[14px] font-cyber-display font-bold text-cyber-primary uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyber-primary rotate-45 animate-pulse" />
            System_Configuration
          </h2>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close settings panel"
            title="Close Settings"
            className="w-8 h-8 flex items-center justify-center border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary hover:text-black transition-all duration-300 diagonal-cut"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="relative z-10 p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Theme */}
          <div>
            <label className="block text-[10px] font-cyber-display font-bold text-cyber-primary uppercase tracking-[0.2em] mb-3 opacity-60">
              Visual_Interface_Protocol
            </label>
            <div className="flex gap-2">
              {[
                { value: "light", icon: Sun, label: "LIGHT" },
                { value: "dark", icon: Moon, label: "DARK" },
                { value: "system", icon: Monitor, label: "AUTO" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 border transition-all duration-300 diagonal-cut ${theme === value
                    ? "bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    : "bg-black/20 border-white/5 text-cyber-muted hover:border-white/20 hover:bg-white/5"
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-[9px] font-cyber-mono font-bold tracking-[0.1em]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div>
            <label className="block text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2">
              Audio Output
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleToggleSound}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 border transition-colors ${soundEnabled
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-[#02050a] border-cyan-900 text-cyan-700 hover:border-cyan-500/50"
                  }`}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-[8px] font-bold tracking-widest uppercase">SFX</span>
              </button>
              <button
                onClick={handleToggleMusic}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 border transition-colors ${musicEnabled
                  ? "bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                  : "bg-[#02050a] border-cyan-900 text-cyan-700 hover:border-cyan-500/50"
                  }`}
              >
                <Music size={16} />
                <span className="text-[8px] font-bold tracking-widest uppercase">BGM</span>
              </button>
            </div>
          </div>

          {/* Gateway */}
          <div className="p-4 border border-cyber-primary/20 bg-black/30 relative diagonal-cut">
            <div className="absolute -top-[7px] left-4 px-2 bg-[#050a15] text-[9px] font-cyber-mono font-bold text-cyber-primary uppercase tracking-[0.2em] border border-cyber-primary/20">
              Gateway_Uplink
            </div>
            <div className="space-y-4 mt-3">
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="ws://127.0.0.1:18789"
                className="w-full bg-black/40 border border-cyber-primary/30 p-3 text-[11px] font-cyber-mono font-bold text-cyber-primary placeholder:text-cyber-primary/20 focus:outline-none focus:border-cyber-primary diagonal-cut uppercase"
              />
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={gatewayToken}
                  onChange={(e) => setGatewayToken(e.target.value)}
                  placeholder="AUTHORIZATION_TOKEN"
                  className="w-full bg-black/40 border border-cyber-primary/30 p-3 pr-12 text-[11px] font-cyber-mono font-bold text-cyber-primary placeholder:text-cyber-primary/20 focus:outline-none focus:border-cyber-primary diagonal-cut uppercase"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-primary/40 hover:text-cyber-primary transition-colors"
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleSaveGateway}
                className="w-full py-3 bg-cyber-primary/10 border border-cyber-primary/40 text-cyber-primary text-[10px] font-cyber-display font-bold uppercase tracking-[0.3em] hover:bg-cyber-primary hover:text-black transition-all duration-300 diagonal-cut"
              >
                DEPLOY_CONFIGURATION
              </button>
            </div>
          </div>

          {/* Debug */}
          <div>
            <label className="block text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2">
              Developer Tools
            </label>
            <button
              onClick={handleToggleDebug}
              className={`w-full flex items-center justify-center gap-2 py-3 border transition-colors ${debugMode
                ? "bg-yellow-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                : "bg-[#02050a] border-cyan-900 text-cyan-700 hover:border-cyan-500/50"
                }`}
            >
              <Bug size={14} />
              <span className="text-[9px] font-black tracking-widest uppercase">Enable Debug Mode</span>
            </button>
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-cyan-500/30">
            <button
              onClick={handleResetDefaults}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#02050a] border border-red-900 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
              <span className="text-[9px] font-black tracking-widest uppercase">FACTORY RESET</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
