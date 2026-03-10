"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Users, ChevronRight } from "lucide-react";
import {
  ALL_WORKER_SPRITES,
  DEFAULT_OPERATIVE_AGENT_ID,
  getWorkerSpriteByAgentId,
  type WorkerSpriteConfig,
} from "@/components/game/config/animations";
import CharacterPortrait from "./CharacterPortrait";

interface CharacterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (character: WorkerSpriteConfig) => void;
  selectedCharacterKey?: string;
}

/** Department display labels + badge color */
const DEPT_DISPLAY: Record<string, { label: string; badgeClass: string }> = {
  intel: { label: "INTEL", badgeClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" },
  content: { label: "CONTENT", badgeClass: "bg-pink-500/20 text-pink-400 border-pink-500/50" },
  commerce: { label: "COMMERCE", badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
  ops: { label: "OPS", badgeClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50" },
  research: { label: "RESEARCH", badgeClass: "bg-teal-500/20 text-teal-400 border-teal-500/50" },
  labs: { label: "LABS", badgeClass: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50" },
};

type DeptFilter = "all" | "intel" | "content" | "commerce" | "ops" | "research" | "labs";

export default function CharacterSelector({ isOpen, onClose, onSelect, selectedCharacterKey }: CharacterSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedCharacterKey || DEFAULT_OPERATIVE_AGENT_ID);
  const [filter, setFilter] = useState<DeptFilter>("all");

  // Compute unique departments from the sprite list
  const departments = useMemo(() => {
    const depts = new Set(ALL_WORKER_SPRITES.map((s) => s.dept).filter(Boolean));
    return Array.from(depts) as string[];
  }, []);

  useEffect(() => {
    setSelected(selectedCharacterKey || DEFAULT_OPERATIVE_AGENT_ID);
  }, [selectedCharacterKey]);

  if (!isOpen) return null;

  const filteredCharacters = ALL_WORKER_SPRITES.filter((char) => {
    if (filter === "all") return true;
    return char.dept === filter;
  });

  const selectedChar = getWorkerSpriteByAgentId(selected) || ALL_WORKER_SPRITES[0];

  const handleSelect = (character: WorkerSpriteConfig) => {
    const nextId = character.agentId ?? character.key;
    setSelected(nextId);
    onSelect?.(character);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02050a]/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-[#050a15] border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,240,255,0.2)] flex flex-col relative overflow-hidden h-full max-h-[80vh]">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b-2 border-cyan-500/50 bg-[#0a0f1c] z-10">
          <div className="absolute top-0 left-0 w-2 h-2 border-r border-b border-cyan-400" />
          <div className="flex items-center gap-3">
            <div className="p-1.5 border border-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-white uppercase tracking-[0.2em]">
                Clone Selection Protocol
              </h2>
              <p className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-widest mt-1">AVAILABLE POOL: {ALL_WORKER_SPRITES.length} UNITS // DIVISIONS: {departments.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close Selection Protocol"
            className="w-8 h-8 flex items-center justify-center border border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-1 relative z-10 h-full min-h-0">
          {/* Character Grid */}
          <div className="flex-1 p-5 flex flex-col h-full min-h-0">
            {/* Filter Tabs — by department */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors border ${filter === "all"
                  ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "bg-[#02050a] text-cyan-700 border-cyan-900 hover:text-cyan-400 hover:border-cyan-500/50"
                  }`}
              >
                GLOBAL ({ALL_WORKER_SPRITES.length})
              </button>
              {departments.map((dept) => {
                const info = DEPT_DISPLAY[dept];
                const count = ALL_WORKER_SPRITES.filter((s) => s.dept === dept).length;
                return (
                  <button
                    key={dept}
                    onClick={() => setFilter(dept as DeptFilter)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors border ${filter === dept
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                      : "bg-[#02050a] text-cyan-700 border-cyan-900 hover:text-cyan-400 hover:border-cyan-500/50"
                      }`}
                  >
                    {info?.label ?? dept.toUpperCase()} ({count})
                  </button>
                );
              })}
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar flex-1 pb-4">
              {filteredCharacters.map((character, idx) => {
                const isSelected = selected === character.agentId;
                const deptInfo = character.dept ? DEPT_DISPLAY[character.dept] : null;

                return (
                  <button
                    key={`${character.agentId ?? character.key}-${idx}`}
                    onClick={() => handleSelect(character)}
                    className={`relative p-3 border transition-all text-left flex flex-col ${isSelected
                      ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                      : "border-slate-800 bg-[#02050a] hover:border-cyan-500/50"
                      }`}
                  >
                    {/* Character Avatar */}
                    <div
                      className="w-full aspect-square mb-3 flex items-center justify-center border border-slate-800 bg-black/40 overflow-hidden relative"
                      style={{ borderColor: isSelected ? "var(--pixel-cyan)" : undefined }}
                    >
                      <CharacterPortrait spritePath={character.path} name={character.label} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </div>

                    {/* Name + code */}
                    <div className="flex flex-col gap-1 mb-2">
                      <span className={`text-[11px] font-black uppercase tracking-widest truncate ${isSelected ? "text-cyan-400" : "text-white"}`}>
                        {character.label}
                      </span>
                      {character.agentCode && (
                        <span className="text-[8px] font-mono text-cyan-700">{character.agentCode}</span>
                      )}
                    </div>

                    {/* Department indicator */}
                    {deptInfo && (
                      <span className={`px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase border inline-block fit-content ${deptInfo.badgeClass}`}>
                        {deptInfo.label}
                      </span>
                    )}

                    {/* Color bar */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    )}

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character Details Sidebar */}
          <div className="w-72 p-5 bg-[#02050a] border-l border-cyan-500/30 flex flex-col overflow-hidden">
            {selectedChar ? (
              <div className="flex flex-col h-full h-full min-h-0">
                {/* Large Portrait Preview */}
                <div className="w-full h-40 border border-cyan-500/50 bg-black flex items-center justify-center relative mb-4">
                  <div className="absolute top-0 left-0 w-3 h-3 border-r border-b border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-l border-t border-cyan-400" />
                  <div className="scale-150 transform transition-transform">
                    <CharacterPortrait spritePath={selectedChar.path} name={selectedChar.label} />
                  </div>
                </div>

                {/* Selected Character Name */}
                <h3 className="text-[16px] font-black text-white mb-1 uppercase tracking-[0.1em]">
                  {selectedChar.label}
                </h3>

                {/* Department Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {selectedChar.dept && DEPT_DISPLAY[selectedChar.dept] && (
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${DEPT_DISPLAY[selectedChar.dept].badgeClass}`}>
                      {DEPT_DISPLAY[selectedChar.dept].label}
                    </span>
                  )}
                  {selectedChar.agentCode && (
                    <span className="px-2 py-0.5 border border-slate-700 bg-[#050a15] text-slate-400 text-[8px] font-mono">
                      {selectedChar.agentCode}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-4">
                  {/* Personality */}
                  {selectedChar.personality && (
                    <div>
                      <label className="text-[8px] font-black text-cyan-600 uppercase tracking-widest block mb-1">Psych Profile</label>
                      <p className="text-[10px] text-slate-300 leading-relaxed bg-[#050a15] p-2 border border-slate-800">
                        {selectedChar.personality}
                      </p>
                    </div>
                  )}

                  {/* Catchphrases */}
                  {selectedChar.catchphrases && selectedChar.catchphrases.length > 0 && (
                    <div>
                      <label className="text-[8px] font-black text-cyan-600 uppercase tracking-widest block mb-2">Vocal Patterns</label>
                      <div className="space-y-1.5">
                        {selectedChar.catchphrases.map((phrase, i) => (
                          <div
                            key={i}
                            className="px-2 py-1.5 bg-[#050a15] border border-cyan-900/50 text-[9px] text-cyan-400 italic"
                          >
                            &quot;{phrase}&quot;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Use Button */}
                <div className="pt-4 border-t border-cyan-500/30 bg-[#02050a] mt-auto">
                  <button
                    onClick={() => {
                      onSelect?.(selectedChar);
                      onClose();
                    }}
                    className="w-full py-3 border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  >
                    DEPLOY OPERATIVE
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full border border-dashed border-cyan-900 text-[9px] font-black uppercase tracking-widest text-cyan-700 m-4">
                AWAITING SELECTION
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
