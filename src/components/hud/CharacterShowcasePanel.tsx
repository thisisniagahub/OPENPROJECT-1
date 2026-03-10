"use client";

import { useState, useEffect } from "react";
import {
  X,
  Star,
  Lock,
  Zap,
  Brain,
  Heart,
  Shield,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  ENHANCED_CHARACTERS,
  RARITY_COLORS,
  calculatePowerLevel,
  getCharacterStatsDisplay,
  type EnhancedCharacter,
  type CharacterRarity,
} from "@/lib/character-system";

interface CharacterShowcasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  onSelect: (characterId: string) => void;
}

// Animated sprite component
function CharacterSprite({ character, size = "large", animate = true }: {
  character: EnhancedCharacter;
  size?: "small" | "medium" | "large";
  animate?: boolean;
}) {
  const [frame, setFrame] = useState(0);

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, [animate]);

  const bounceTransform = animate ? `translateY(${Math.sin(frame * Math.PI / 2) * 3}px)` : "";

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative overflow-hidden`}
      style={{
        backgroundColor: `${character.color}20`,
        border: `3px solid ${character.color}`,
        boxShadow: `0 0 20px ${character.color}40`,
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${character.color}30 0%, transparent 70%)`,
        }}
      />

      {/* Character emoji/icon based on ID */}
      <div
        className="text-4xl relative z-10"
        style={{ transform: bounceTransform }}
      >
        {character.id === "stan" && "🧢"}
        {character.id === "kyle" && "🟢"}
        {character.id === "cartman" && "🔴"}
        {character.id === "kenny" && "🧥"}
        {character.id === "butters" && "😊"}
        {character.id === "randy" && "🔬"}
        {character.id === "chef" && "👨‍🍳"}
        {character.id === "garrison" && "📚"}
      </div>

      {/* Level badge */}
      <div
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: character.color }}
      >
        {character.level.current}
      </div>
    </div>
  );
}

// Stat bar component
function StatBar({ label, value, color, animated = true }: {
  label: string;
  value: number;
  color: string;
  animated?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-10">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${animated ? "animate-pulse" : ""}`}
          style={{
            width: `${value}%`,
            backgroundColor: color.replace("text-", "").replace("-400", ""),
          }}
        />
      </div>
      <span className={`text-xs font-mono ${color} w-8 text-right`}>{value}</span>
    </div>
  );
}

// Rarity badge
function RarityBadge({ rarity }: { rarity: CharacterRarity }) {
  const colors = RARITY_COLORS[rarity];
  return (
    <span
      className={`px-2 py-1 text-xs font-bold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {rarity.toUpperCase()}
    </span>
  );
}

// Ability card
function AbilityCard({ ability, isActive }: { ability: { id: string; name: string; description: string; icon: string; cooldown: number }; isActive?: boolean }) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isActive
          ? "bg-purple-500/20 border-purple-500"
          : "bg-slate-800/50 border-slate-700"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl">{ability.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{ability.name}</div>
          <div className="text-xs text-slate-400 mt-1">{ability.description}</div>
          {ability.cooldown > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              ⏱️ {ability.cooldown}s cooldown
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// XP progress bar
function XpProgressBar({ level }: { level: { current: number; xp: number; xpToNext: number; totalXp: number } }) {
  const percentage = (level.xp / level.xpToNext) * 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Level {level.current}</span>
        <span>{level.xp} / {level.xpToNext} XP</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function CharacterShowcasePanel({
  isOpen,
  onClose,
  selectedCharacterId,
  onSelect,
}: CharacterShowcasePanelProps) {
  const [hoveredCharacter, setHoveredCharacter] = useState<EnhancedCharacter | null>(null);
  const [filterRarity, setFilterRarity] = useState<CharacterRarity | "all">("all");
  const [showLocked, setShowLocked] = useState(true);

  if (!isOpen) return null;

  const displayCharacter = hoveredCharacter || ENHANCED_CHARACTERS.find((c) => c.id === selectedCharacterId);

  // Filter characters
  const filteredCharacters = ENHANCED_CHARACTERS.filter((c) => {
    if (!showLocked && !c.unlocked) return false;
    if (filterRarity !== "all" && c.rarity !== filterRarity) return false;
    return true;
  });

  // Group by faction
  const groupedCharacters = filteredCharacters.reduce((acc, char) => {
    const faction = char.faction || "Other";
    if (!acc[faction]) acc[faction] = [];
    acc[faction].push(char);
    return acc;
  }, {} as Record<string, EnhancedCharacter[]>);

  const powerLevel = displayCharacter ? calculatePowerLevel(displayCharacter.stats) : 0;
  const statsDisplay = displayCharacter ? getCharacterStatsDisplay(displayCharacter.stats) : [];

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-6xl mx-4 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Character Showcase
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {ENHANCED_CHARACTERS.filter((c) => c.unlocked).length} / {ENHANCED_CHARACTERS.length} unlocked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterRarity("all")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filterRarity === "all" ? "bg-white text-black" : "bg-slate-700 text-slate-300"
                }`}
              >
                All
              </button>
              {(["common", "rare", "epic", "legendary"] as CharacterRarity[]).map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setFilterRarity(rarity)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filterRarity === rarity
                      ? "bg-white text-black"
                      : `${RARITY_COLORS[rarity].bg} ${RARITY_COLORS[rarity].text}`
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>

            {/* Show locked toggle */}
            <button
              onClick={() => setShowLocked(!showLocked)}
              className={`p-2 rounded-lg transition-colors ${
                showLocked ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-400"
              }`}
              title="Toggle locked characters"
            >
              <Lock className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Character Grid */}
          <div className="w-80 border-r border-slate-700 overflow-y-auto p-4">
            {Object.entries(groupedCharacters).map(([faction, characters]) => (
              <div key={faction} className="mb-4">
                <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">
                  {faction}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {characters.map((character) => {
                    const isSelected = selectedCharacterId === character.id;
                    const isHovered = hoveredCharacter?.id === character.id;
                    const rarityColors = RARITY_COLORS[character.rarity];

                    return (
                      <button
                        key={character.id}
                        onClick={() => character.unlocked && onSelect(character.id)}
                        onMouseEnter={() => setHoveredCharacter(character)}
                        onMouseLeave={() => setHoveredCharacter(null)}
                        disabled={!character.unlocked}
                        className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? `border-yellow-500 bg-yellow-500/10 ${rarityColors.glow} shadow-lg`
                            : isHovered
                            ? `border-slate-500 bg-slate-800/50`
                            : "border-slate-700 bg-slate-800/30"
                        } ${!character.unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <CharacterSprite character={character} size="small" animate={isSelected} />

                        <div className="mt-2">
                          <div
                            className="text-sm font-bold"
                            style={{ color: character.color }}
                          >
                            {character.name}
                          </div>
                          <div className="text-xs text-slate-500">{character.role}</div>
                        </div>

                        {!character.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Lock className="w-6 h-6 text-slate-400" />
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-1 right-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Character Details */}
          <div className="flex-1 overflow-y-auto p-6">
            {displayCharacter && (
              <div className="space-y-6">
                {/* Character header */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <CharacterSprite character={displayCharacter} size="large" animate />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: displayCharacter.color }}
                      >
                        {displayCharacter.fullName}
                      </h3>
                      <RarityBadge rarity={displayCharacter.rarity} />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <span className="px-2 py-0.5 bg-slate-700 rounded">{displayCharacter.role}</span>
                      {displayCharacter.nickname && (
                        <span className="text-slate-500">aka "{displayCharacter.nickname}"</span>
                      )}
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed">
                      {displayCharacter.bio}
                    </p>

                    {/* Power level */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-lg font-bold text-white">PWR {powerLevel}</span>
                      </div>
                      <XpProgressBar level={displayCharacter.level} />
                    </div>
                  </div>
                </div>

                {/* Stats section */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Character Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {statsDisplay.map((stat) => (
                      <StatBar
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        color={stat.color}
                      />
                    ))}
                  </div>
                </div>

                {/* Abilities section */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Abilities
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {displayCharacter.abilities.map((ability) => (
                      <AbilityCard key={ability.id} ability={ability} />
                    ))}
                  </div>

                  {displayCharacter.passiveAbility && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-300">
                        <Info className="w-4 h-4" />
                        <span className="font-medium">Passive:</span>
                      </div>
                      <p className="text-xs text-blue-200 mt-1">{displayCharacter.passiveAbility}</p>
                    </div>
                  )}
                </div>

                {/* Skills & Catchphrases */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-400" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {displayCharacter.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      Catchphrases
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {displayCharacter.catchphrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-400 italic"
                        >
                          "{phrase}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backstory */}
                {displayCharacter.backstory && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      Backstory
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {displayCharacter.backstory}
                    </p>
                  </div>
                )}

                {/* Unlock condition for locked characters */}
                {!displayCharacter.unlocked && displayCharacter.unlockCondition && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-300">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">Unlock Condition</span>
                    </div>
                    <p className="text-sm text-yellow-200 mt-1">{displayCharacter.unlockCondition}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Select a character to use as your AI agent
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 text-black text-sm rounded-lg hover:bg-yellow-400 transition-colors font-medium"
            style={{ fontFamily: '"Ark Pixel", monospace' }}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
