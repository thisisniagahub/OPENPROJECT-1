"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  X, Check, Zap, Brain, Shield, Star, Sparkles,
  Search, User, ChevronRight, Wifi, WifiOff,
} from "lucide-react";
import {
  ALL_WORKER_SPRITES,
  getWorkerSpriteByAgentId,
  type WorkerSpriteConfig,
} from "@/components/game/config/animations";

/* ─────────────────────────────── Types ─────────────────────────────── */

interface CharacterSelectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  onSelect: (characterId: string) => void;
}

type DeptFilter = "all" | "intel" | "content" | "commerce" | "ops" | "research" | "labs";

/* ────────────────────────────── Constants ──────────────────────────── */

const DEPT_META: Record<string, { label: string; color: string; glow: string; icon: string }> = {
  intel: { label: "INTEL", color: "#4fc3f7", glow: "shadow-cyan-500/40", icon: "🔍" },
  content: { label: "CONTENT", color: "#ff6eb4", glow: "shadow-pink-500/40", icon: "✍️" },
  commerce: { label: "COMMERCE", color: "#ffb347", glow: "shadow-amber-500/40", icon: "💰" },
  ops: { label: "OPS", color: "#8c9eff", glow: "shadow-indigo-500/40", icon: "⚙️" },
  research: { label: "RESEARCH", color: "#80cbc4", glow: "shadow-teal-500/40", icon: "🔬" },
  labs: { label: "LABS", color: "#b388ff", glow: "shadow-purple-500/40", icon: "🧪" },
};

const DEPT_TONE_CLASS: Record<DeptFilter, string> = {
  all: "agent-tone-default",
  intel: "agent-tone-intel",
  content: "agent-tone-content",
  commerce: "agent-tone-commerce",
  ops: "agent-tone-ops",
  research: "agent-tone-research",
  labs: "agent-tone-labs",
};

function getToneClass(dept?: string): string {
  if (dept && dept in DEPT_TONE_CLASS) {
    return DEPT_TONE_CLASS[dept as DeptFilter];
  }

  return DEPT_TONE_CLASS.all;
}

const SKILL_ICONS: Record<string, ReactNode> = {
  default: <Star className="w-3 h-3" />,
  Trend: <Zap className="w-3 h-3" />,
  Analysis: <Brain className="w-3 h-3" />,
  Optimization: <Brain className="w-3 h-3" />,
  Writing: <Star className="w-3 h-3" />,
  Recovery: <Shield className="w-3 h-3" />,
  Script: <Sparkles className="w-3 h-3" />,
  Design: <Sparkles className="w-3 h-3" />,
};

function matchSkillIcon(skill: string): ReactNode {
  for (const [key, icon] of Object.entries(SKILL_ICONS)) {
    if (key !== "default" && skill.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return SKILL_ICONS.default;
}

/* ────────────────────────────── Subcomponents ──────────────────────── */

function AgentAvatar({ character, isSelected, isHovered, toneClass }: {
  character: WorkerSpriteConfig;
  isSelected: boolean;
  isHovered: boolean;
  toneClass: string;
}) {
  return (
    <div className="relative mx-auto mb-4 w-[64px] h-[64px]">
      {/* Avatar square */}
      <div
        className={`${toneClass} w-full h-full flex items-center justify-center text-2xl transition-all duration-300 border backdrop-blur-md diagonal-cut ${
          isSelected
            ? "animate-pulse bg-[var(--agent-accent-bg-strong)] border-[var(--agent-accent)] shadow-[0_0_15px_var(--agent-accent-shadow-strong)]"
            : isHovered
              ? "bg-[var(--agent-accent-bg-soft)] border-[var(--agent-accent-border-soft)]"
              : "bg-black/40 border-white/10"
        }`}
      >
        <span className="drop-shadow-md avatar-icon">
          {DEPT_META[character.dept ?? ""]?.icon ?? "👤"}
        </span>
      </div>
      {/* Online indicator for OpenClaw-mapped agents */}
      {character.openclawId && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-black flex items-center justify-center shadow-[0_0_5px_#00ff00]">
        </div>
      )}
    </div>
  );
}

/** Department filter tab pixel button */
function DeptTab({ dept, label, icon, isActive, count, onClick }: {
  dept: DeptFilter;
  label: string;
  icon: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  const toneClass = getToneClass(dept);

  return (
    <button
      onClick={onClick}
      title={`Filter by ${label}`}
      className={`${toneClass} relative flex items-center gap-2 px-4 py-2 text-[10px] font-cyber-display font-bold uppercase tracking-[0.2em] transition-all duration-300 diagonal-cut border ${
        isActive
          ? "text-white bg-[var(--agent-accent-bg-soft)] border-[var(--agent-accent)] shadow-[0_0_10px_var(--agent-accent-shadow-soft)]"
          : "text-cyber-muted hover:text-cyber-text bg-white/[0.03] border-white/10"
      }`}
    >
      <span className="text-[12px]">{icon}</span>
      <span>{label}</span>
      <span className={`ml-1 px-1.5 py-0.5 border ${isActive ? "border-white/30 bg-white/10" : "border-slate-700 bg-slate-800"}`}>
        {count}
      </span>
    </button>
  );
}

/* ────────────────────────────── Main Component ────────────────────── */

export default function CharacterSelectPanel({
  isOpen,
  onClose,
  selectedCharacterId,
  onSelect,
}: CharacterSelectPanelProps) {
  const [hoveredCharacter, setHoveredCharacter] = useState<WorkerSpriteConfig | null>(null);
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Track selection flash
  const handleSelect = useCallback((agentId: string) => {
    setLastSelectedId(agentId);
    onSelect(agentId);
    setTimeout(() => setLastSelectedId(null), 600);
  }, [onSelect]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    let list = ALL_WORKER_SPRITES;
    if (deptFilter !== "all") {
      list = list.filter(c => c.dept === deptFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.label.toLowerCase().includes(q) ||
        (c.agentCode ?? "").toLowerCase().includes(q) ||
        (c.personality ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [deptFilter, searchQuery]);

  // Dept counts
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_WORKER_SPRITES.length };
    for (const c of ALL_WORKER_SPRITES) {
      counts[c.dept ?? ""] = (counts[c.dept ?? ""] ?? 0) + 1;
    }
    return counts;
  }, []);

  const displayCharacter =
    hoveredCharacter ||
    getWorkerSpriteByAgentId(selectedCharacterId) ||
    ALL_WORKER_SPRITES[0];

  const displaySkills = displayCharacter?.personality?.split(/[,—]/).map(s => s.trim()).filter(Boolean) ?? [];
  const displayDeptMeta = DEPT_META[displayCharacter?.dept ?? ""];
  const displayToneClass = getToneClass(displayCharacter?.dept);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[95] flex items-center justify-center transition-all duration-300 
        ${isVisible ? "bg-[#02050a]/90 backdrop-blur-sm" : "bg-black/0 pointer-events-none"}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Main Panel */}
      <div
        className={`relative w-full max-w-6xl h-[80vh] mx-4 modern-glass border-cyber-primary/30 flex flex-col diagonal-cut transition-all duration-500
          ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* ═════════════ Header ═════════════ */}
        <div className="relative flex-none px-6 py-4 border-b-2 border-cyan-500/50 bg-[#0a0f1c]">
          <div className="absolute top-0 left-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400" />

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-cyber-display font-bold text-cyber-primary flex items-center gap-4 tracking-[0.3em] uppercase">
                <div className="w-4 h-4 bg-cyber-primary animate-pulse rotate-45" />
                OPERATIVE_DATABASE
              </h2>
              <p className="text-[10px] text-cyber-muted font-cyber-mono font-bold tracking-[0.2em] uppercase mt-2 opacity-60">
                TOTAL_UNITS: {ALL_WORKER_SPRITES.length} {"|"} ACTIVE_NODES: <span className="text-cyber-primary">{ALL_WORKER_SPRITES.filter(a => a.openclawId).length}</span>
              </p>
            </div>

            {/* Search & Close */}
            <div className="flex items-center gap-6">
              <div className="relative flex items-center group">
                <div className="absolute left-4 text-cyber-primary font-cyber-mono font-bold text-[14px]">{">"}</div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="QUERY_IDENTIFIER..."
                  className="w-72 pl-10 pr-4 py-3 bg-black/40 border border-cyber-primary/30 text-[11px] font-cyber-mono font-bold text-cyber-primary placeholder:text-cyber-primary/20 focus:outline-none focus:border-cyber-primary focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] uppercase tracking-[0.2em] diagonal-cut"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center border border-cyber-accent-red/30 bg-cyber-accent-red/5 text-cyber-accent-red hover:bg-cyber-accent-red hover:text-white transition-all duration-300 diagonal-cut"
                title="TERMINATE_SESSION"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2 custom-scrollbar">
            <DeptTab dept="all" label="ALL_UNITS" icon="🏢" isActive={deptFilter === "all"} count={deptCounts.all ?? 0} onClick={() => setDeptFilter("all")} />
            {Object.entries(DEPT_META).map(([key, meta]) => (
              <DeptTab
                key={key}
                dept={key as DeptFilter}
                label={meta.label}
                icon={meta.icon}
                isActive={deptFilter === key}
                count={deptCounts[key] ?? 0}
                onClick={() => setDeptFilter(key as DeptFilter)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* ═════════════ Agent Grid ═════════════ */}
          <div className="flex-1 p-4 bg-[#050a15] relative">
            <div
              ref={gridRef}
              className="grid grid-cols-4 gap-3 max-h-[100%] absolute inset-4 overflow-y-auto pr-2 custom-scrollbar"
            >
              {filteredAgents.map((character, idx) => {
                const isSelected = selectedCharacterId === character.agentId;
                const isHovered = hoveredCharacter?.agentId === character.agentId;
                const toneClass = getToneClass(character.dept);

                return (
                  <button
                    key={`${character.agentId ?? character.key}-${idx}`}
                    onClick={() => handleSelect(character.agentId ?? character.key)}
                    onMouseEnter={() => setHoveredCharacter(character)}
                    onMouseLeave={() => setHoveredCharacter(null)}
                    className={`relative p-4 border text-left transition-all duration-300 diagonal-cut ${isSelected
                      ? "bg-cyber-primary/10 border-cyber-primary"
                      : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5"
                      }`}
                  >
                    {/* Selection Corner Accents */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-cyber-primary animate-pulse" strokeWidth={3} />
                      </div>
                    )}

                    <AgentAvatar character={character} isSelected={isSelected} isHovered={isHovered} toneClass={toneClass} />

                    {/* Name + Code */}
                    <div className="text-center mt-2">
                      <div
                        className={`text-[11px] font-black uppercase tracking-widest truncate ${
                          isSelected || isHovered ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {character.label}
                      </div>
                      {character.agentCode && (
                        <div className="text-[9px] text-slate-600 font-mono tracking-wider mt-0.5">{character.agentCode}</div>
                      )}
                      {/* Dept badge */}
                      {character.dept && (
                        <div
                          className={`${toneClass} mt-1.5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border inline-block bg-[var(--agent-accent-bg-subtle)] border-[var(--agent-accent-border-muted)] ${
                            isSelected || isHovered ? "text-[var(--agent-accent)]" : "text-slate-500"
                          }`}
                        >
                          {character.dept}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredAgents.length === 0 && (
                <div className="col-span-4 py-12 flex flex-col items-center justify-center text-cyan-900 border border-cyan-900/40 bg-cyan-900/10 border-dashed">
                  <div className="w-4 h-4 bg-cyan-900 mb-3 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">NO_RECORDS_FOUND</span>
                </div>
              )}
            </div>
          </div>

          {/* ═════════════ Detail Sidebar ═════════════ */}
          <div className="w-96 border-l border-cyber-primary/20 bg-black/40 backdrop-blur-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[1px] h-full bg-cyber-primary/30" />
            {/* Subtle sidebar scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[size:100%_4px] pointer-events-none opacity-50" />

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {displayCharacter && (
                <div key={displayCharacter.agentId ?? displayCharacter.key} className="space-y-6">
                  {/* Hero section */}
                  <div className="text-center relative">
                    <div className="w-full h-[1px] bg-slate-800 mb-4 absolute top-10 left-0 -z-10" />

                    {/* Big avatar */}
                    <div className="relative inline-block bg-black/40 p-3 border border-cyber-primary/30 diagonal-cut">
                      <div
                        className={`${displayToneClass} w-20 h-20 flex items-center justify-center text-4xl border-[1px] diagonal-cut bg-[var(--agent-accent-bg-subtle)] border-[var(--agent-accent)] shadow-[0_0_20px_var(--agent-accent-shadow-soft)]`}
                      >
                        <span className={`${displayToneClass} drop-shadow-lg drop-shadow-[0_0_8px_var(--agent-accent)]`}>
                          {displayDeptMeta?.icon ?? "👤"}
                        </span>
                      </div>

                      {/* Connection status */}
                      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 border flex items-center gap-2 text-[9px] font-cyber-mono font-bold uppercase tracking-[0.2em] bg-black diagonal-cut ${
                        displayCharacter.openclawId
                          ? "border-cyber-primary text-cyber-primary"
                          : "border-white/20 text-white/40"
                      }`}>
                        {displayCharacter.openclawId ? (
                          <><div className="w-2 h-2 bg-cyber-primary animate-pulse" /> LINK_ESTABLISHED</>
                        ) : (
                          <><div className="w-2 h-2 bg-white/20" /> STANDBY_MODE</>
                        )}
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="text-[16px] font-black uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                        {displayCharacter.label}
                      </div>
                      <div className="text-[10px] text-cyan-500/70 font-mono mt-1 font-bold">
                        ID: {displayCharacter.agentId}
                      </div>
                    </div>

                    {displayCharacter.personality && (
                      <div className={`${displayToneClass} mt-4 p-3 bg-[#02050a] border border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed border-l-4 border-l-[var(--agent-accent)]`}>
                        &quot;{displayCharacter.personality}&quot;
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    {displayDeptMeta && (
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-[10px] font-cyber-mono font-bold text-cyber-muted uppercase tracking-[0.1em]">Division</span>
                        <div className={`${displayToneClass} flex items-center gap-2 text-[11px] font-cyber-display font-bold uppercase tracking-[0.1em] text-[var(--agent-accent)]`}>
                          <span>{displayDeptMeta.icon}</span>
                          {displayDeptMeta.label}
                        </div>
                      </div>
                    )}

                    {displayCharacter.openclawId && (
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-[10px] font-cyber-mono font-bold text-cyber-muted uppercase tracking-[0.1em]">Network_ID</span>
                        <span className="text-[11px] font-cyber-mono font-bold text-cyber-primary">{displayCharacter.openclawId}</span>
                      </div>
                    )}

                    {/* Skills */}
                    {displaySkills.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-[10px] text-white font-cyber-display font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-1 h-4 bg-cyber-primary" /> NEURAL_CAPABILITIES
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {displaySkills.map((skill, i) => (
                            <div
                              key={skill}
                              className="flex items-center gap-3 px-3 py-2 border border-white/5 bg-white/5 text-[10px] font-cyber-mono font-bold text-white/80 uppercase tracking-widest diagonal-cut hover:bg-white/10 transition-colors"
                            >
                              <span className="text-cyber-primary">{matchSkillIcon(skill)}</span>
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Catchphrases */}
                    {displayCharacter.catchphrases && displayCharacter.catchphrases.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-[10px] text-white font-cyber-display font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-1 h-4 bg-cyber-accent-purple" /> KNOWN_DIRECTIVES
                        </div>
                        <div className="space-y-2">
                          {displayCharacter.catchphrases.slice(0, 3).map((phrase, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] text-cyber-muted font-cyber-mono bg-black/40 px-3 py-2 border border-white/5 diagonal-cut italic"
                            >
                              {"> "} {phrase}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ═════════════ Apply Button ═════════════ */}
            <div className="flex-none p-6 border-t border-cyber-primary/20 bg-black/40">
              <button
                onClick={onClose}
                className="w-full relative px-6 py-4 border-2 border-cyber-primary transition-all duration-300 font-cyber-display font-bold uppercase tracking-[0.3em] text-[12px] group overflow-hidden bg-cyber-primary/10 text-cyber-primary hover:bg-cyber-primary hover:text-black hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] diagonal-cut"
              >
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-cyber-primary group-hover:bg-black transition-colors" />
                CONFIRM_SYNCHRONIZATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
