"use client";

import { useState } from "react";
import { X, Check, Zap, Brain, Shield, Heart, Star } from "lucide-react";
import { SOUTH_PARK_CHARACTERS, type SouthParkCharacter } from "@/lib/southpark-characters";

interface CharacterSelectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  onSelect: (characterId: string) => void;
}

const SKILL_ICONS: Record<string, React.ReactNode> = {
  "Leadership": <Star className="w-3 h-3" />,
  "Problem Solving": <Brain className="w-3 h-3" />,
  "Moral Compass": <Heart className="w-3 h-3" />,
  "Analysis": <Brain className="w-3 h-3" />,
  "Logic": <Zap className="w-3 h-3" />,
  "Debate": <Shield className="w-3 h-3" />,
  "Manipulation": <Zap className="w-3 h-3" />,
  "Strategy": <Brain className="w-3 h-3" />,
  "default": <Star className="w-3 h-3" />,
};

export default function CharacterSelectPanel({
  isOpen,
  onClose,
  selectedCharacterId,
  onSelect,
}: CharacterSelectPanelProps) {
  const [hoveredCharacter, setHoveredCharacter] = useState<SouthParkCharacter | null>(null);

  if (!isOpen) return null;

  const displayCharacter = hoveredCharacter || SOUTH_PARK_CHARACTERS.find(c => c.id === selectedCharacterId);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              🎮 Select Your Agent Character
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose a South Park character as your AI agent
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex">
          {/* Character Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-3 gap-3">
              {SOUTH_PARK_CHARACTERS.map((character) => {
                const isSelected = selectedCharacterId === character.id;
                const isHovered = hoveredCharacter?.id === character.id;

                return (
                  <button
                    key={character.id}
                    onClick={() => onSelect(character.id)}
                    onMouseEnter={() => setHoveredCharacter(character)}
                    onMouseLeave={() => setHoveredCharacter(null)}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-500/10"
                        : isHovered
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    {/* Character Avatar */}
                    <div
                      className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${character.color}30`, border: `2px solid ${character.color}` }}
                    >
                      {character.id === "stan" && "🧢"}
                      {character.id === "kyle" && "🧢"}
                      {character.id === "cartman" && "🧢"}
                      {character.id === "kenny" && "🧥"}
                      {character.id === "butters" && "😊"}
                    </div>

                    {/* Name */}
                    <div className="text-center">
                      <div
                        className="text-sm font-bold text-white mb-1"
                        style={{ fontFamily: '"Ark Pixel", monospace', color: character.color }}
                      >
                        {character.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {character.fullName}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character Details */}
          <div className="w-72 p-4 border-l border-slate-700 bg-slate-800/30">
            {displayCharacter && (
              <div className="space-y-4">
                {/* Name & Color */}
                <div>
                  <div
                    className="text-xl font-bold mb-1"
                    style={{ fontFamily: '"Ark Pixel", monospace', color: displayCharacter.color }}
                  >
                    {displayCharacter.fullName}
                  </div>
                  <div className="text-xs text-slate-400 italic">
                    "{displayCharacter.personality}"
                  </div>
                </div>

                {/* Bio */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  {displayCharacter.bio}
                </div>

                {/* Skills */}
                <div>
                  <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
                    Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayCharacter.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
                      >
                        {SKILL_ICONS[skill] || SKILL_ICONS.default}
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Catchphrases */}
                <div>
                  <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
                    Catchphrases
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {displayCharacter.catchphrases.slice(0, 3).map((phrase, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-300 italic bg-slate-700/30 px-2 py-1 rounded"
                      >
                        "{phrase}"
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice Style */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Voice Style:</span>
                  <span
                    className="px-2 py-1 rounded text-xs capitalize"
                    style={{ backgroundColor: `${displayCharacter.color}20`, color: displayCharacter.color }}
                  >
                    {displayCharacter.voiceStyle}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-500" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            Character affects dialogue style and task interactions
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 text-black text-sm rounded-lg hover:bg-yellow-400 transition-colors"
            style={{ fontFamily: '"Ark Pixel", monospace' }}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
