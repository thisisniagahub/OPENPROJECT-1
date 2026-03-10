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
import CharacterSelectPanel from "@/components/hud/CharacterSelectPanel";
import TerminalModal from "@/components/panel/TerminalModal";
import GameErrorBoundary from "@/components/game/GameErrorBoundary";
import { ToastProvider, toastSuccess } from "@/components/ui/toast-provider";
import {
  DEFAULT_OPERATIVE_AGENT_ID,
  OPERATIVE_CHANGED_EVENT,
  getCharacterConfig,
  getSelectedCharacter,
  setSelectedCharacter,
} from "@/components/game/config/animations";

import {
  Gamepad2,
  Edit3,
  Keyboard,
  Settings,
  History,
  Users,
  Wifi,
  WifiOff,
  UserCircle,
  Activity,
  Sparkles
} from "lucide-react";

// Dynamically import PhaserGame to avoid SSR issues
const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
  loading: () => <LoadingScreen text="BOOTING NEURAL LINK..." color="cyan" />,
});

// Editor component
const OfficeEditor = dynamic(() => import("@/components/editor/OfficeEditor"), {
  ssr: false,
  loading: () => <LoadingScreen text="ACCESSING VOID ENGINE..." color="purple" />,
});

function LoadingScreen({ text, color }: { text: string; color: "cyan" | "purple" }) {
  return (
    <div className="flex items-center justify-center h-full bg-black/90 backdrop-blur-xl">
      <div className="text-center relative">
        <div className={`w-24 h-24 border-2 rounded-full animate-spin border-t-transparent mb-8 mx-auto ${color === "cyan" ? "border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.3)]" : "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]"}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full animate-pulse ${color === "cyan" ? "bg-cyan-500/20" : "bg-purple-500/20"}`} />
        </div>
        <p className={`${color === "cyan" ? "text-cyan-400" : "text-purple-400"} font-cyber-display font-bold tracking-[0.3em] text-[10px] uppercase animate-pulse`}>
          {text}
        </p>
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
  const [mounted, setMounted] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<string>(DEFAULT_OPERATIVE_AGENT_ID);

  useEffect(() => {
    setMounted(true);
    const saved = getSelectedCharacter();
    setCurrentCharacter(saved);
  }, []);

  const handleCharacterSelect = useCallback((characterId: string) => {
    setSelectedCharacter(characterId);
    const normalizedCharacterId = getSelectedCharacter();
    setCurrentCharacter(normalizedCharacterId);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(OPERATIVE_CHANGED_EVENT, {
          detail: { agentId: normalizedCharacterId },
        }),
      );
    }

    const character = getCharacterConfig(normalizedCharacterId);
    if (character) {
      toastSuccess(
        `OPERATIVE IDENTIFIED: ${character.label.toUpperCase()}`,
        character.personality?.split('.')[0] ?? "Neural sync established."
      );
    }
  }, []);

  const handleEditMode = useCallback(() => setMode("edit"), []);
  const handlePlayMode = useCallback(() => setMode("play"), []);
  const handleToggleShortcuts = useCallback(() => setShowShortcuts((prev) => !prev), []);
  const handleToggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);
  const handleToggleTaskHistory = useCallback(() => setShowTaskHistory((prev) => !prev), []);
  const handleToggleAgentPanel = useCallback(() => setShowAgentPanel((prev) => !prev), []);
  const handleToggleCharacterSelect = useCallback(() => setShowCharacterSelect((prev) => !prev), []);

  const handleConnect = useCallback(() => {
    if (state.connection === "connected") disconnect();
    else connect();
  }, [state.connection, connect, disconnect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      switch (key) {
        case "?": e.preventDefault(); handleToggleShortcuts(); break;
        case "e": e.preventDefault(); handleEditMode(); break;
        case "p": e.preventDefault(); handlePlayMode(); break;
        case ",": e.preventDefault(); handleToggleSettings(); break;
        case "c": e.preventDefault(); handleConnect(); break;
        case "1": e.preventDefault(); handleToggleAgentPanel(); break;
        case "2": e.preventDefault(); handleToggleTaskHistory(); break;
        case "3": e.preventDefault(); handleToggleCharacterSelect(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleShortcuts, handleEditMode, handlePlayMode, handleToggleSettings, handleConnect, handleToggleAgentPanel, handleToggleTaskHistory, handleToggleCharacterSelect]);

  const isConnected = state.connection === "connected";
  const selectedChar = getCharacterConfig(currentCharacter);

  if (!mounted) return null;

  return (
    <main className="h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-white flex flex-col p-4 gap-4 relative z-0">
      {/* AMBIENT BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,240,255,0.03)_50%,transparent_50%)] bg-[length:100%_4px] z-0" />

      {/* TOP HEADER */}
      <header className="flex-none h-[64px] flex items-center justify-between z-10 w-full max-w-[1700px] mx-auto">
        {/* TOP LEFT - OP MODE */}
        <div className="modern-glass px-4 py-2 flex items-center gap-4 min-w-[320px] diagonal-cut">
          <div className="text-[10px] text-cyber-primary font-cyber-display font-bold uppercase tracking-[0.2em] leading-none opacity-80">System_Mode</div>
          <div className="flex gap-2">
            <button
              onClick={handlePlayMode}
              className={`text-[10px] font-cyber-mono font-bold tracking-widest uppercase px-3 py-1.5 transition-all duration-300 ${mode === "play" ? "bg-cyber-primary text-cyber-background shadow-[0_0_15px_rgba(0,240,255,0.6)]" : "text-cyber-muted hover:text-cyber-text"}`}
            >PLAY (P)</button>
            <button
              onClick={handleEditMode}
              className={`text-[10px] font-cyber-mono font-bold tracking-widest uppercase px-3 py-1.5 transition-all duration-300 ${mode === "edit" ? "bg-cyber-accent-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.6)]" : "text-cyber-muted hover:text-cyber-text"}`}
            >EDIT (E)</button>
          </div>
        </div>

        {/* TOP CENTER - BRANDING */}
        <div className="modern-glass px-12 py-2 relative flex items-center justify-center gap-8 shadow-[0_0_30px_rgba(0,240,255,0.1)] border-t-0">
          <div className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-cyber-primary" />
          <div className="absolute -right-[1px] top-0 bottom-0 w-[2px] bg-cyber-primary" />

          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl font-cyber-display font-bold tracking-[-0.05em] text-cyber-text uppercase italic">
              <span className="text-cyber-primary not-italic">AGENT</span> TOWN
            </h1>
            <div className="bg-green-500 text-black px-3 py-1 text-[9px] font-cyber-display font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-white/10">
              ACTIVE
            </div>
          </div>
          <div className="text-[12px] font-cyber-display font-bold text-cyber-primary/60 tracking-[0.4em] uppercase border-l border-cyber-muted pl-8 h-8 flex items-center">
            NIAGABOT_CTR
          </div>
        </div>

        {/* TOP RIGHT - UTILITIES */}
        <div className="flex items-center gap-6 min-w-[320px] justify-end">
          <ModelSelector />

          <button onClick={handleConnect} className={`modern-glass flex items-center gap-3 px-5 py-2 transition-all duration-300 diagonal-cut ${isConnected ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "border-cyber-accent-red/30"}`}>
            {isConnected ? <Activity size={14} className="text-green-400 animate-pulse" /> : <WifiOff size={14} className="text-cyber-accent-red" />}
            <div className="text-[10px] font-cyber-mono font-bold tracking-[0.1em] uppercase leading-none">{isConnected ? "ONLINE" : "OFFLINE"}</div>
          </button>

          <div className="modern-glass flex items-center p-1.5 gap-2 border-cyber-muted/40">
            <button onClick={handleToggleCharacterSelect} className={`p-1.5 hover:text-cyber-accent-purple transition-all duration-300 ${showCharacterSelect ? "text-cyber-accent-purple" : "text-cyber-muted"}`} title="Select Operative (3)">
              <UserCircle size={18} />
            </button>
            <button onClick={handleToggleAgentPanel} className={`p-1.5 hover:text-cyber-primary transition-all duration-300 ${showAgentPanel ? "text-cyber-primary" : "text-cyber-muted"}`} title="Agent Hub (1)">
              <Users size={18} />
            </button>
            <button onClick={handleToggleTaskHistory} className={`p-1.5 hover:text-cyber-primary transition-all duration-300 ${showTaskHistory ? "text-cyber-primary" : "text-cyber-muted"}`} title="Mission History (2)">
              <History size={18} />
            </button>
            <button onClick={handleToggleSettings} className={`p-1.5 hover:text-cyber-primary transition-all duration-300 ${showSettings ? "text-cyber-primary" : "text-cyber-muted"}`} title="Settings (,)">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* AGENT HUB OVERLAY */}
      {showAgentPanel && (
        <div className="absolute left-8 top-24 z-50">
          <AgentStatusPanel />
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      {mode === "play" ? (
        <GameHud>
          <div className="w-full h-full relative">
            <Suspense fallback={<LoadingScreen text="SYNCHRONIZING CORE..." color="cyan" />}>
              <GameErrorBoundary>
                <PhaserGame />
              </GameErrorBoundary>
            </Suspense>
          </div>
        </GameHud>
      ) : (
        <div className="flex-1 max-w-[1700px] w-full mx-auto grid grid-cols-[1fr] gap-4 min-h-0 z-10 mt-4">
          <div className="pixel-panel flex flex-col p-1.5 relative min-h-0 shadow-[0_0_40px_rgba(168,85,247,0.05)] border-purple-500/80 bg-black">
            <div className="absolute top-0 left-0 px-3 py-1.5 bg-purple-500/20 border-b border-r border-purple-500/50 z-20 backdrop-blur-sm flex items-center gap-2 font-cyber-display font-black text-[10px] text-white tracking-widest uppercase">
              <Sparkles size={12} className="text-purple-400" />
              VOID_ARCHITECT_MODE
            </div>
            <div className="flex-1 relative overflow-hidden bg-black/40 rounded-sm border border-slate-900/50">
              <Suspense fallback={<LoadingScreen text="INITIATING VOID BRAIN..." color="purple" />}>
                <OfficeEditor />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      <KeyboardShortcutsOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <TaskHistory isOpen={showTaskHistory} onClose={() => setShowTaskHistory(false)} />
      <TerminalModal />
      <OnboardingTutorial />

      <CharacterSelectPanel
        isOpen={showCharacterSelect}
        onClose={() => setShowCharacterSelect(false)}
        selectedCharacterId={currentCharacter}
        onSelect={handleCharacterSelect}
      />

      {/* HUD FOOTER INFOS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 z-10 px-8 py-2 modern-glass opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex flex-col">
          <div className="text-[8px] font-cyber-display font-bold text-cyber-muted tracking-[0.2em] uppercase">Active_Operative</div>
          <div className="text-[10px] font-cyber-mono font-bold text-cyber-primary uppercase tracking-widest">
            {selectedChar?.label ?? "UNASSIGNED"}
          </div>
        </div>
        <div className="w-px h-6 bg-cyber-muted/30" />
        <div className="flex flex-col">
          <div className="text-[8px] font-cyber-display font-bold text-cyber-muted tracking-[0.2em] uppercase">Control_Link</div>
          <div className={`text-[10px] font-cyber-mono font-bold uppercase tracking-widest ${isConnected ? "text-green-400" : "text-cyber-accent-red"}`}>
            {isConnected ? "ENCRYPTED" : "UNSTABLE"}
          </div>
        </div>
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
