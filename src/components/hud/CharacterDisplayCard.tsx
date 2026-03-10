"use client";

import { useState, useEffect } from "react";
import { Zap, Sparkles } from "lucide-react";
import {
  getCharacterById,
  calculatePowerLevel,
  getCharacterStatsDisplay,
  type EnhancedCharacter,
} from "@/lib/character-system";

interface CharacterDisplayCardProps {
  characterId: string;
  variant?: "compact" | "full" | "minimal";
  showStats?: boolean;
  showLevel?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

// Mini stat bars for compact view
function MiniStatBars({ stats }: { stats: ReturnType<typeof getCharacterStatsDisplay> }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {stats.slice(0, 6).map((stat) => (
        <div key={stat.label} className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500">{stat.label}</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${stat.value}%`,
                backgroundColor: stat.color.replace("text-", "").replace("-400", ""),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Character emoji helper
function getCharacterEmoji(id: string): string {
  const emojis: Record<string, string> = {
    stan: "🧢",
    kyle: "🟢",
    cartman: "🔴",
    kenny: "🧥",
    butters: "😊",
    randy: "🔬",
    chef: "👨‍🍳",
    garrison: "📚",
  };
  return emojis[id] || "👤";
}

function CharacterDisplayCardContent({
  character,
  variant,
  showStats,
  showLevel,
  animate,
  onClick,
  frame,
  currentPhrase,
}: {
  character: EnhancedCharacter;
  variant: "compact" | "full" | "minimal";
  showStats: boolean;
  showLevel: boolean;
  animate: boolean;
  onClick?: () => void;
  frame: number;
  currentPhrase: string;
}) {
  const powerLevel = calculatePowerLevel(character.stats);
  const statsDisplay = getCharacterStatsDisplay(character.stats);
  const bounceTransform = animate ? `translateY(${Math.sin(frame * Math.PI / 2) * 2}px)` : "";

  // Minimal variant
  if (variant === "minimal") {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${onClick ? "cursor-pointer hover:bg-slate-700/50" : ""}`}
        style={{ backgroundColor: `${character.color}15` }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: `${character.color}30` }}
        >
          {getCharacterEmoji(character.id)}
        </div>
        <span className="text-xs font-medium" style={{ color: character.color }}>
          {character.name}
        </span>
        {showLevel && (
          <span className="text-[10px] text-slate-500">Lv.{character.level.current}</span>
        )}
      </div>
    );
  }

  // Full variant
  if (variant === "full") {
    return (
      <div
        onClick={onClick}
        className={`bg-slate-800/80 border border-slate-700 rounded-xl p-4 ${onClick ? "cursor-pointer hover:border-slate-500" : ""}`}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center relative"
            style={{
              backgroundColor: `${character.color}20`,
              border: `2px solid ${character.color}`,
              boxShadow: `0 0 15px ${character.color}30`,
            }}
          >
            <div className="text-3xl" style={{ transform: bounceTransform }}>
              {getCharacterEmoji(character.id)}
            </div>
            {showLevel && (
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: character.color }}
              >
                {character.level.current}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold" style={{ color: character.color }}>
                {character.fullName}
              </h3>
              <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">
                {character.rarity.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">{character.role}</p>

            <div className="flex items-center gap-2 mt-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">PWR {powerLevel}</span>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                <span>LV {character.level.current}</span>
                <span>{character.level.xp}/{character.level.xpToNext}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  style={{ width: `${(character.level.xp / character.level.xpToNext) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {showStats && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <MiniStatBars stats={statsDisplay} />
          </div>
        )}

        {animate && currentPhrase && (
          <div className="mt-3 p-2 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-300 italic">"{currentPhrase}"</p>
          </div>
        )}
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/80 border border-slate-700 rounded-lg p-3 ${onClick ? "cursor-pointer hover:border-slate-500" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center relative"
          style={{
            backgroundColor: `${character.color}20`,
            border: `2px solid ${character.color}`,
          }}
        >
          <div className="text-xl" style={{ transform: bounceTransform }}>
            {getCharacterEmoji(character.id)}
          </div>
          {showLevel && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: character.color }}
            >
              {character.level.current}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: character.color }}>
              {character.name}
            </span>
            <span className="text-[10px] px-1 py-0.5 bg-slate-700 rounded text-slate-400">
              {character.rarity}
            </span>
          </div>
          <div className="text-xs text-slate-500">{character.role}</div>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-white">{powerLevel}</span>
          </div>
        </div>

        {showStats && (
          <div className="w-20">
            <MiniStatBars stats={statsDisplay} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CharacterDisplayCard({
  characterId,
  variant = "compact",
  showStats = false,
  showLevel = true,
  animate = true,
  onClick,
}: CharacterDisplayCardProps) {
  const [frame, setFrame] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState("");

  const character = getCharacterById(characterId);

  // Animation frame - always call this hook
  useEffect(() => {
    if (!animate || !character) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, [animate, character]);

  // Random idle phrase - always call this hook
  useEffect(() => {
    if (!animate || !character) return;
    const phrases = character.idlePhrases;
    setCurrentPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    const interval = setInterval(() => {
      setCurrentPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [animate, character]);

  if (!character) return null;

  return (
    <CharacterDisplayCardContent
      character={character}
      variant={variant}
      showStats={showStats}
      showLevel={showLevel}
      animate={animate}
      onClick={onClick}
      frame={frame}
      currentPhrase={currentPhrase}
    />
  );
}

// Floating character widget for game HUD
export function CharacterFloatingWidget({
  characterId,
  onOpenPanel,
}: {
  characterId: string;
  onOpenPanel: () => void;
}) {
  const [frame, setFrame] = useState(0);

  const character = getCharacterById(characterId);

  // Animation frame - always call this hook
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  if (!character) return null;

  const bounceTransform = `translateY(${Math.sin(frame * Math.PI / 2) * 2}px)`;

  return (
    <button
      onClick={onOpenPanel}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg hover:border-slate-500 transition-all group"
      style={{ boxShadow: `0 0 20px ${character.color}20` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: `${character.color}20`,
          border: `2px solid ${character.color}`,
        }}
      >
        <div className="text-lg" style={{ transform: bounceTransform }}>
          {getCharacterEmoji(character.id)}
        </div>
      </div>

      <div className="text-left">
        <div className="font-bold text-sm" style={{ color: character.color }}>
          {character.name}
        </div>
        <div className="text-[10px] text-slate-500">
          Lv.{character.level.current} • {character.role}
        </div>
      </div>

      <Sparkles className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
