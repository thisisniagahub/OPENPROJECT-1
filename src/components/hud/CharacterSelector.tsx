"use client";

import { useState } from "react";
import { X, Users, Sparkles, ChevronRight } from "lucide-react";
import { ALL_WORKER_SPRITES, type WorkerSpriteConfig } from "@/components/game/config/animations";

interface CharacterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (character: WorkerSpriteConfig) => void;
  selectedCharacterKey?: string;
}

// Character personalities and catchphrases
const CHARACTER_INFO: Record<string, { personality: string; catchphrases: string[]; color: string }> = {
  // Regular characters
  "character_02": {
    personality: "Friendly and helpful assistant who loves coding",
    catchphrases: ["Let me help you with that!", "Coding is fun!", "Almost done!"],
    color: "#8B5CF6"
  },
  "character_03": {
    personality: "Analytical problem solver with attention to detail",
    catchphrases: ["Interesting problem...", "Let me analyze this.", "Solution found!"],
    color: "#3B82F6"
  },
  "character_04": {
    personality: "Creative thinker who thinks outside the box",
    catchphrases: ["What if we try this?", "Creative solution incoming!", "I love challenges!"],
    color: "#EC4899"
  },
  "character_05": {
    personality: "Methodical worker who ensures quality",
    catchphrases: ["Quality first!", "Checking the details...", "Done right!"],
    color: "#10B981"
  },
  "character_06": {
    personality: "Fast and efficient multitasker",
    catchphrases: ["Multitasking mode!", "Speed and accuracy!", "Done in no time!"],
    color: "#F59E0B"
  },
  // South Park characters
  "southpark_stan": {
    personality: "The everyman - level-headed and morally grounded. Often says 'Oh my God, they killed Kenny!'",
    catchphrases: ["Oh my God!", "This is pretty messed up right here.", "Dude, seriously?", "I learned something today..."],
    color: "#3B82F6"
  },
  "southpark_kyle": {
    personality: "The moral compass - intelligent, principled, and Jewish. Often gives life lessons.",
    catchphrases: ["You know, I learned something today...", "This isn't right!", "I'm a Jew, a lonely Jew...", "That's not cool!"],
    color: "#22C55E"
  },
  "southpark_cartman": {
    personality: "The manipulator - narcissistic, scheming, but oddly effective. 'Respect my authoritah!'",
    catchphrases: ["Respect my authoritah!", "Screw you guys, I'm going home!", "But moooom!", "Kitty!"],
    color: "#EF4444"
  },
  "southpark_kenny": {
    personality: "The immortal - always comes back. Muffled speech but has dark knowledge.",
    catchphrases: ["Mmph mmph mmph!", "(muffled) Oh my God!", "(muffled) They killed me!", "(muffled) Holy sh*t!"],
    color: "#F97316"
  },
  "southpark_butters": {
    personality: "The innocent - naive but pure-hearted. Always tries his best.",
    catchphrases: ["Oh hamburgers!", "I'm just a nice kid!", "Well gosh!", "That's not very nice..."],
    color: "#06B6D4"
  },
};

export default function CharacterSelector({ isOpen, onClose, onSelect, selectedCharacterKey }: CharacterSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedCharacterKey || "character_02");
  const [filter, setFilter] = useState<"all" | "regular" | "southpark">("all");

  if (!isOpen) return null;

  const filteredCharacters = ALL_WORKER_SPRITES.filter((char) => {
    if (filter === "all") return true;
    if (filter === "regular") return !char.isSouthPark;
    if (filter === "southpark") return char.isSouthPark;
    return true;
  });

  const selectedChar = ALL_WORKER_SPRITES.find((c) => c.key === selected);
  const selectedInfo = CHARACTER_INFO[selected];

  const handleSelect = (character: WorkerSpriteConfig) => {
    setSelected(character.key);
    onSelect?.(character);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl mx-4 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                Character Selection
              </h2>
              <p className="text-xs text-slate-400">Choose your agent personality</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex">
          {/* Character Grid */}
          <div className="flex-1 p-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: "all", label: "All" },
                { key: "regular", label: "Regular" },
                { key: "southpark", label: "South Park" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as typeof filter)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    filter === key
                      ? "bg-purple-500 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                  style={{ fontFamily: '"Ark Pixel", monospace' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
              {filteredCharacters.map((character) => {
                const info = CHARACTER_INFO[character.key];
                const isSelected = selected === character.key;

                return (
                  <button
                    key={character.key}
                    onClick={() => handleSelect(character)}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                    }`}
                  >
                    {/* Character Avatar */}
                    <div
                      className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: `${info?.color}20` || "rgba(139, 92, 246, 0.2)" }}
                    >
                      <div className="text-4xl">
                        {character.isSouthPark ? "🧑‍🎤" : "👤"}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold text-white truncate"
                        style={{ fontFamily: '"Ark Pixel", monospace' }}
                      >
                        {character.label}
                      </span>
                      {character.isSouthPark && (
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                      )}
                    </div>

                    {/* Color indicator */}
                    <div
                      className="h-1 rounded-full"
                      style={{ backgroundColor: info?.color || "#8B5CF6" }}
                    />

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character Details */}
          <div className="w-64 p-4 bg-slate-800/50 border-l border-slate-700">
            {selectedChar && selectedInfo ? (
              <div>
                {/* Selected Character Name */}
                <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                  {selectedChar.label}
                </h3>

                {/* Character Type */}
                <div className="flex items-center gap-2 mb-3">
                  {selectedChar.isSouthPark ? (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                      South Park
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                      Regular
                    </span>
                  )}
                </div>

                {/* Personality */}
                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-1">Personality</label>
                  <p className="text-xs text-white leading-relaxed">
                    {selectedInfo.personality}
                  </p>
                </div>

                {/* Catchphrases */}
                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-2">Catchphrases</label>
                  <div className="space-y-1">
                    {selectedInfo.catchphrases.map((phrase, i) => (
                      <div
                        key={i}
                        className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-300 italic"
                      >
                        "{phrase}"
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Button */}
                <button
                  onClick={() => {
                    onSelect?.(selectedChar);
                    onClose();
                  }}
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors font-bold"
                  style={{ fontFamily: '"Ark Pixel", monospace' }}
                >
                  Use This Character
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-slate-500">Select a character</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
