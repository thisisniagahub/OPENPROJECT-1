"use client";

import { useState, useEffect } from "react";
import {
  X,
  Star,
  Lock,
  Zap,
  Brain,
  Heart,
  TrendingUp,
  Award,
  Sparkles,
  Users,
  School,
  Home,
  User,
} from "lucide-react";
import {
  ALL_CHARACTERS,
  CATEGORY_ORDER,
  getCategoryLabel,
  getRarityLabel,
  getRarityColor,
  calculatePowerLevel,
  getCharacterEmoji,
  type SouthParkCharacter,
  type CharacterCategory,
  type CharacterRarity,
} from "@/lib/character-system";

interface CharacterShowcasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  onSelect: (characterId: string) => void;
}

// Character sprite component
function CharacterSprite({
  character,
  size = "large",
  animate = true,
}: {
  character: SouthParkCharacter;
  size?: "small" | "medium" | "large";
  animate?: boolean;
}) {
  const [frame, setFrame] = useState(0);

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-28 h-28",
  };

  const emojiSize = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-4xl",
  };

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, [animate]);

  const bounceTransform = animate
    ? `translateY(${Math.sin(frame * Math.PI * 0.5) * 3}px)`
    : "";

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

      {/* Character emoji */}
      <div
        className={`${emojiSize[size]} relative z-10`}
        style={{ transform: bounceTransform }}
      >
        {getCharacterEmoji(character.id)}
      </div>

      {/* Level badge */}
      <div
        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: character.color }}
      >
        {character.level.current}
      </div>
    </div>
  );
}

// Stat bar component
function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-10">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// XP progress bar
function XpProgressBar({
  level,
}: {
  level: { current: number; xp: number; xpToNext: number; totalXp: number };
}) {
  const percentage = (level.xp / level.xpToNext) * 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Level {level.current}</span>
        <span>
          {level.xp} / {level.xpToNext} XP
        </span>
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

// Category icon
function CategoryIcon({ category }: { category: CharacterCategory }) {
  switch (category) {
    case "the_four_boys":
      return <Users className="w-4 h-4" />;
    case "4th_graders":
      return <User className="w-4 h-4" />;
    case "school_faculty":
      return <School className="w-4 h-4" />;
    case "extended_families":
      return <Home className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
}

export default function CharacterShowcasePanel({
  isOpen,
  onClose,
  selectedCharacterId,
  onSelect,
}: CharacterShowcasePanelProps) {
  const [hoveredCharacter, setHoveredCharacter] =
    useState<SouthParkCharacter | null>(null);
  const [filterRarity, setFilterRarity] = useState<CharacterRarity | "all">("all");
  const [showLocked, setShowLocked] = useState(true);

  if (!isOpen) return null;

  const displayCharacter =
    hoveredCharacter ||
    ALL_CHARACTERS.find((c) => c.id === selectedCharacterId);

  // Filter characters
  const filteredCharacters = ALL_CHARACTERS.filter((c) => {
    if (!showLocked && !c.unlocked) return false;
    if (filterRarity !== "all" && c.rarity !== filterRarity) return false;
    return true;
  });

  // Group by category
  const groupedCharacters = CATEGORY_ORDER.reduce((acc, category) => {
    const chars = filteredCharacters.filter((c) => c.category === category);
    if (chars.length > 0) {
      acc[category] = chars;
    }
    return acc;
  }, {} as Record<CharacterCategory, SouthParkCharacter[]>);

  const powerLevel = displayCharacter
    ? calculatePowerLevel(displayCharacter.stats)
    : 0;

  const rarityColors = displayCharacter
    ? getRarityColor(displayCharacter.rarity)
    : null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-5xl mx-4 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-4">
            <div>
              <h2
                className="text-xl font-bold text-white flex items-center gap-2"
                style={{ fontFamily: '"Ark Pixel", monospace' }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                South Park Characters
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {ALL_CHARACTERS.filter((c) => c.unlocked).length} /{" "}
                {ALL_CHARACTERS.length} unlocked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterRarity("all")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filterRarity === "all"
                    ? "bg-white text-black"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                All
              </button>
              {(["main", "recurring", "minor", "background"] as CharacterRarity[]).map(
                (rarity) => {
                  const colors = getRarityColor(rarity);
                  return (
                    <button
                      key={rarity}
                      onClick={() => setFilterRarity(rarity)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filterRarity === rarity
                          ? "bg-white text-black"
                          : `${colors.bg} ${colors.text} ${colors.border}`
                      }`}
                    >
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </button>
                  );
                }
              )}
            </div>

            {/* Show locked toggle */}
            <button
              onClick={() => setShowLocked(!showLocked)}
              className={`p-2 rounded-lg transition-colors ${
                showLocked
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800 text-slate-400"
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
          <div className="w-72 border-r border-slate-700 overflow-y-auto p-4">
            {Object.entries(groupedCharacters).map(([category, characters]) => (
              <div key={category} className="mb-4">
                <h3
                  className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2"
                  style={{ fontFamily: '"Ark Pixel", monospace' }}
                >
                  <CategoryIcon category={category as CharacterCategory} />
                  {getCategoryLabel(category as CharacterCategory)}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {characters.map((character) => {
                    const isSelected = selectedCharacterId === character.id;
                    const isHovered = hoveredCharacter?.id === character.id;
                    const rarityStyles = getRarityColor(character.rarity);

                    return (
                      <button
                        key={character.id}
                        onClick={() =>
                          character.unlocked && onSelect(character.id)
                        }
                        onMouseEnter={() => setHoveredCharacter(character)}
                        onMouseLeave={() => setHoveredCharacter(null)}
                        disabled={!character.unlocked}
                        className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? `border-yellow-500 bg-yellow-500/10`
                            : isHovered
                            ? "border-slate-500 bg-slate-800/50"
                            : "border-slate-700 bg-slate-800/30"
                        } ${!character.unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div
                          className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-lg"
                          style={{
                            backgroundColor: `${character.color}30`,
                            border: `2px solid ${character.color}`,
                          }}
                        >
                          {getCharacterEmoji(character.id)}
                        </div>

                        <div className="text-xs font-bold" style={{ color: character.color }}>
                          {character.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {getRarityLabel(character.rarity)}
                        </div>

                        {!character.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Lock className="w-5 h-5 text-slate-400" />
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
                  <CharacterSprite character={displayCharacter} size="large" animate />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: displayCharacter.color }}
                      >
                        {displayCharacter.fullName}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full border ${rarityColors?.bg} ${rarityColors?.text} ${rarityColors?.border}`}
                      >
                        {getRarityLabel(displayCharacter.rarity).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-2">
                      <span className="px-2 py-0.5 bg-slate-700 rounded flex items-center gap-1">
                        <CategoryIcon category={displayCharacter.category} />
                        {getCategoryLabel(displayCharacter.category)}
                      </span>
                      {displayCharacter.subCategory && (
                        <span className="text-slate-500">
                          • {displayCharacter.subCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      {displayCharacter.age && (
                        <span>Age: {displayCharacter.age}</span>
                      )}
                      {displayCharacter.grade && (
                        <span>Grade: {displayCharacter.grade}</span>
                      )}
                      {displayCharacter.occupation && (
                        <span>Occupation: {displayCharacter.occupation}</span>
                      )}
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mt-3">
                      {displayCharacter.personality}
                    </p>

                    {/* Power level */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-lg font-bold text-white">
                          PWR {powerLevel}
                        </span>
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
                    <StatBar
                      label="INT"
                      value={displayCharacter.stats.intelligence}
                      color="#3B82F6"
                    />
                    <StatBar
                      label="CRE"
                      value={displayCharacter.stats.creativity}
                      color="#A855F7"
                    />
                    <StatBar
                      label="SPD"
                      value={displayCharacter.stats.speed}
                      color="#EAB308"
                    />
                    <StatBar
                      label="ACC"
                      value={displayCharacter.stats.accuracy}
                      color="#22C55E"
                    />
                    <StatBar
                      label="CHA"
                      value={displayCharacter.stats.charisma}
                      color="#EC4899"
                    />
                    <StatBar
                      label="LCK"
                      value={displayCharacter.stats.luck}
                      color="#F97316"
                    />
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Catchphrases */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      Catchphrases
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {displayCharacter.catchphrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-300 italic bg-slate-700/30 px-2 py-1 rounded"
                        >
                          "{phrase}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relatives */}
                  {displayCharacter.relatives && displayCharacter.relatives.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Home className="w-4 h-4 text-blue-400" />
                        Relatives
                      </h4>
                      <div className="space-y-1">
                        {displayCharacter.relatives.map((relative, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-slate-300"
                          >
                            {relative}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Unlock condition for locked characters */}
                {!displayCharacter.unlocked && displayCharacter.unlockCondition && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-300">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">Unlock Condition</span>
                    </div>
                    <p className="text-sm text-yellow-200 mt-1">
                      {displayCharacter.unlockCondition}
                    </p>
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
