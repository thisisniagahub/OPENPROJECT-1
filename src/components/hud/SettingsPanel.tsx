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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
          <h2 className="text-sm font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Theme */}
          <div>
            <label className="block text-xs text-slate-400 mb-2" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              Theme
            </label>
            <div className="flex gap-2">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Monitor, label: "System" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${
                    theme === value
                      ? "bg-purple-500/20 border-purple-500 text-purple-400"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500"
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div>
            <label className="block text-xs text-slate-400 mb-2" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              Audio
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleToggleSound}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${
                  soundEnabled
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                }`}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>Sound</span>
              </button>
              <button
                onClick={handleToggleMusic}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${
                  musicEnabled
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                }`}
              >
                <Music size={16} />
                <span className="text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>Music</span>
              </button>
            </div>
          </div>

          {/* Gateway */}
          <div>
            <label className="block text-xs text-slate-400 mb-2" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              OpenClaw Gateway
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="ws://127.0.0.1:18789"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                style={{ fontFamily: '"Ark Pixel", monospace' }}
              />
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={gatewayToken}
                  onChange={(e) => setGatewayToken(e.target.value)}
                  placeholder="Gateway Token (optional)"
                  className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  style={{ fontFamily: '"Ark Pixel", monospace' }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={handleSaveGateway}
                className="w-full px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                style={{ fontFamily: '"Ark Pixel", monospace' }}
              >
                Save Gateway Config
              </button>
            </div>
          </div>

          {/* Debug */}
          <div>
            <label className="block text-xs text-slate-400 mb-2" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              Developer
            </label>
            <button
              onClick={handleToggleDebug}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${
                debugMode
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                  : "bg-slate-800 border-slate-700 text-slate-500"
              }`}
            >
              <Bug size={16} />
              <span className="text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>Debug Mode</span>
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={handleResetDefaults}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:border-red-500 hover:text-red-400 transition-colors"
          >
            <RotateCcw size={16} />
            <span className="text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>Reset to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
}
