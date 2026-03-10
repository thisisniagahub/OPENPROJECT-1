"use client";

import dynamic from "next/dynamic";
import { useState, Suspense, useCallback, useEffect } from "react";
import { StudioProvider, useStudio } from "@/lib/store";
import GameHud from "@/components/hud/GameHud";
import OnboardingTutorial from "@/components/onboarding/OnboardingTutorial";
import KeyboardShortcutsOverlay from "@/components/hud/KeyboardShortcutsOverlay";
import SettingsPanel from "@/components/hud/SettingsPanel";
import TaskHistory from "@/components/hud/TaskHistory";
import AgentStatusPanel from "@/components/hud/AgentStatusPanel";
import ModelSelector from "@/components/hud/ModelSelector";
import CharacterShowcasePanel from "@/components/hud/CharacterShowcasePanel";
import CharacterDisplayCard, { CharacterFloatingWidget } from "@/components/hud/CharacterDisplayCard";
import { ToastProvider, toastSuccess } from "@/components/ui/toast-provider";
import { getCharacterById, calculatePowerLevel, type EnhancedCharacter } from "@/lib/character-system";

// Helper functions for character selection
function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "stan";
  return localStorage.getItem("agent-town:selected-character") || "stan";
}

function setSelectedCharacter(characterId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("agent-town:selected-character", characterId);
  }
}

// Helper to load character with XP from localStorage
function loadCharacterWithProgress(id: string): EnhancedCharacter | undefined {
  const character = getCharacterById(id);
  if (!character) return undefined;

  // Load saved XP from localStorage
  if (typeof window !== "undefined") {
    const savedXp = localStorage.getItem(`agent-town:character-xp:${id}`);
    if (savedXp) {
      const xp = parseInt(savedXp, 10);
      let currentXp = xp;
      let level = 1;
      let xpToNext = 100;

      while (currentXp >= xpToNext) {
        currentXp -= xpToNext;
        level++;
        xpToNext = Math.floor(100 * Math.pow(1.5, level - 1));
      }

      return {
        ...character,
        level: {
          current: level,
          xp: currentXp,
          xpToNext,
          totalXp: xp,
        },
      };
    }
  }

  return character;
}

import { Gamepad2, Edit3, Keyboard, Settings, History, Users, Wifi, WifiOff, Sparkles } from "lucide-react";

// Dynamically import PhaserGame to avoid SSR issues
const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Agent Town..." color="yellow" />,
});

// Editor component
const OfficeEditor = dynamic(() => import("@/components/editor/OfficeEditor"), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Editor..." color="purple" />,
});

function LoadingScreen({ text, color }: { text: string; color: "yellow" | "purple" }) {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${color === "yellow" ? "border-yellow-500" : "border-purple-500"}`} />
        <p className="text-slate-400" style={{ fontFamily: '"Ark Pixel", monospace' }}>{text}</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { state, connect, disconnect } = useStudio();
  const [mode, setMode] = useState<"play" | "edit">("play");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<string>("");
  const [characterData, setCharacterData] = useState<EnhancedCharacter | undefined>();

  // Load saved character on mount
  useEffect(() => {
    const saved = getSelectedCharacter();
    setCurrentCharacter(saved);
    setCharacterData(loadCharacterWithProgress(saved));
  }, []);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId: string) => {
    setSelectedCharacter(characterId);
    setCurrentCharacter(characterId);
    const character = loadCharacterWithProgress(characterId);
    setCharacterData(character);

    if (character) {
      const powerLevel = calculatePowerLevel(character.stats);
      toastSuccess(
        `Character selected: ${character.fullName}`,
        `Level ${character.level.current} • Power ${powerLevel} • ${character.rarity.toUpperCase()}`
      );
    }
  }, []);

  // Handle mode changes
  const handleEditMode = useCallback(() => setMode("edit"), []);
  const handlePlayMode = useCallback(() => setMode("play"), []);
  const handleToggleShortcuts = useCallback(() => setShowShortcuts((prev) => !prev), []);
  const handleToggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);
  const handleToggleTaskHistory = useCallback(() => setShowTaskHistory((prev) => !prev), []);
  const handleToggleAgentPanel = useCallback(() => setShowAgentPanel((prev) => !prev), []);
  const handleToggleCharacterSelect = useCallback(() => setShowCharacterSelect((prev) => !prev), []);

  const handleConnect = useCallback(() => {
    if (state.connection === "connected") {
      disconnect();
    } else {
      connect();
    }
  }, [state.connection, connect, disconnect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "?":
          e.preventDefault();
          handleToggleShortcuts();
          break;
        case "e":
          e.preventDefault();
          handleEditMode();
          break;
        case "p":
          e.preventDefault();
          handlePlayMode();
          break;
        case ",":
          e.preventDefault();
          handleToggleSettings();
          break;
        case "c":
          e.preventDefault();
          handleConnect();
          break;
        case "1":
          e.preventDefault();
          handleToggleAgentPanel();
          break;
        case "2":
          e.preventDefault();
          handleToggleTaskHistory();
          break;
        case "3":
          e.preventDefault();
          handleToggleCharacterSelect();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleShortcuts, handleEditMode, handlePlayMode, handleToggleSettings, handleConnect, handleToggleAgentPanel, handleToggleTaskHistory, handleToggleCharacterSelect]);

  const isConnected = state.connection === "connected";

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      {/* Top Left - Mode Toggle */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <div className="flex bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setMode("play")}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
              mode === "play" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            <Gamepad2 size={16} />
            Play
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
              mode === "edit" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Top Center - Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <h1 className="text-xl font-bold text-yellow-500 text-center flex items-center gap-2" style={{ fontFamily: '"Ark Pixel", monospace' }}>
          <Sparkles className="w-5 h-5" />
          Agent Town
        </h1>
        <p className="text-xs text-slate-400 text-center">
          OpenClaw AI Agent Workspace
        </p>
      </div>

      {/* Top Right - Action Buttons */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Character Select Button - Enhanced */}
        <button
          onClick={handleToggleCharacterSelect}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            showCharacterSelect
              ? "bg-purple-500 text-white"
              : "bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Character Showcase (3)"
        >
          {characterData && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: `${characterData.color}30` }}
            >
              {characterData.id === "stan" && "🧢"}
              {characterData.id === "kyle" && "🟢"}
              {characterData.id === "cartman" && "🔴"}
              {characterData.id === "kenny" && "🧥"}
              {characterData.id === "butters" && "😊"}
              {characterData.id === "randy" && "🔬"}
              {characterData.id === "chef" && "👨‍🍳"}
              {characterData.id === "garrison" && "📚"}
            </div>
          )}
          <span
            className="text-xs font-medium"
            style={{ color: characterData?.color }}
          >
            {characterData?.name || "Select"}
          </span>
          {characterData && (
            <span className="text-[10px] px-1 py-0.5 bg-slate-700 rounded text-slate-400">
              Lv.{characterData.level.current}
            </span>
          )}
        </button>

        {/* Agent Panel Toggle */}
        <button
          onClick={handleToggleAgentPanel}
          className={`p-2 rounded-lg transition-colors ${
            showAgentPanel
              ? "bg-purple-500 text-white"
              : "bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Agent Status (1)"
        >
          <Users size={16} />
        </button>

        {/* Task History Toggle */}
        <button
          onClick={handleToggleTaskHistory}
          className={`p-2 rounded-lg transition-colors ${
            showTaskHistory
              ? "bg-yellow-500 text-black"
              : "bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Task History (2)"
        >
          <History size={16} />
        </button>

        {/* Model Selector */}
        <ModelSelector />

        {/* Connection Status */}
        <button
          onClick={handleConnect}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isConnected
              ? "bg-green-500/20 border border-green-500/50 text-green-400"
              : "bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Connect/Disconnect (C)"
          style={{ fontFamily: '"Ark Pixel", monospace' }}
        >
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="text-xs">{isConnected ? "Online" : "Offline"}</span>
        </button>

        {/* Settings */}
        <button
          onClick={handleToggleSettings}
          className={`p-2 rounded-lg transition-colors ${
            showSettings
              ? "bg-purple-500 text-white"
              : "bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Settings (,)"
        >
          <Settings size={16} />
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={handleToggleShortcuts}
          className={`p-2 rounded-lg transition-colors ${
            showShortcuts
              ? "bg-yellow-500 text-black"
              : "bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard size={16} />
        </button>
      </div>

      {/* Left Side - Agent Status Panel */}
      {showAgentPanel && (
        <div className="absolute left-4 top-20 z-40">
          <AgentStatusPanel />
        </div>
      )}

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
        <div className="absolute top-20 right-4 z-40 bg-slate-900/95 border border-slate-700 rounded-lg p-4 w-80">
          <h3 className="text-sm font-bold text-purple-400 mb-3" style={{ fontFamily: '"Ark Pixel", monospace' }}>
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

      {/* Overlays */}
      <KeyboardShortcutsOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <TaskHistory isOpen={showTaskHistory} onClose={() => setShowTaskHistory(false)} />

      {/* Character Showcase Panel */}
      <CharacterShowcasePanel
        isOpen={showCharacterSelect}
        onClose={() => setShowCharacterSelect(false)}
        selectedCharacterId={currentCharacter}
        onSelect={handleCharacterSelect}
      />

      <OnboardingTutorial />

      {/* Bottom Left - Character Floating Widget */}
      {characterData && (
        <CharacterFloatingWidget
          characterId={currentCharacter}
          onOpenPanel={handleToggleCharacterSelect}
        />
      )}

      {/* Bottom Right - Mode Indicator */}
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
  );
}

export default function Home() {
  return (
    <StudioProvider>
      <ToastProvider />
      <AppContent />
    </StudioProvider>
  );
}
