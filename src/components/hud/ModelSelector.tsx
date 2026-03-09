"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Cpu, Search, Check, Zap, Code, Brain, Sparkles, Star, X } from "lucide-react";
import { useStudio } from "@/lib/store";
import type { ModelChoice } from "@/lib/gateway-handler";

interface ExtendedModelChoice extends ModelChoice {
  name?: string;
  description?: string;
  capabilities?: string[];
  badges?: string[];
  isDefault?: boolean;
}

interface ModelSelectorProps {
  onModelSelect?: (model: ExtendedModelChoice) => void;
}

// Badge colors
const BADGE_COLORS: Record<string, string> = {
  "Recommended": "bg-green-500/20 text-green-400 border-green-500/30",
  "Coding": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Fast": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Premium": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Advanced": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Multimodal": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "1M Context": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Open Source": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Large Model": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

// Provider icons/colors
const PROVIDER_COLORS: Record<string, string> = {
  "qwen-portal": "#06B6D4", // Cyan
  "anthropic": "#D97706",   // Orange
  "openai": "#10B981",      // Green
  "google": "#4285F4",      // Blue
  "deepseek": "#8B5CF6",    // Purple
};

// Capability icons
const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  "code-generation": <Code className="w-3 h-3" />,
  "coding": <Code className="w-3 h-3" />,
  "reasoning": <Brain className="w-3 h-3" />,
  "multimodal": <Sparkles className="w-3 h-3" />,
  "fast": <Zap className="w-3 h-3" />,
  "default": <Star className="w-3 h-3" />,
};

export default function ModelSelector({ onModelSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [models, setModels] = useState<ExtendedModelChoice[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const { state } = useStudio();
  const isConnected = state.connection === "connected";

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
        if (data.defaultModel) {
          setSelectedModel(data.defaultModel);
        }
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = useCallback((model: ExtendedModelChoice) => {
    setSelectedModel(model.id);
    setIsOpen(false);
    setSearch("");
    onModelSelect?.(model);
  }, [onModelSelect]);

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.id.toLowerCase().includes(search.toLowerCase()) ||
      (model.name?.toLowerCase().includes(search.toLowerCase())) ||
      model.provider.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = !selectedProvider || model.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  // Group models by provider
  const groupedModels = filteredModels.reduce((acc, model) => {
    const provider = model.provider || "Unknown";
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, ExtendedModelChoice[]>);

  // Get unique providers
  const providers = [...new Set(models.map(m => m.provider))];

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const providerColor = selectedModelData ? PROVIDER_COLORS[selectedModelData.provider] || "#64748B" : "#64748B";

  if (!isConnected) {
    return (
      <div className="px-3 py-2 text-slate-500 text-xs flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded" style={{ fontFamily: '"Ark Pixel", monospace' }}>
        <Cpu className="w-4 h-4" />
        <span>Connect to select model</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:border-slate-500 transition-colors min-w-[200px]"
      >
        <Cpu className="w-4 h-4" style={{ color: providerColor }} />
        <div className="flex-1 text-left">
          <div className="text-xs text-white truncate" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            {isLoading ? "Loading..." : selectedModelData?.name || "Select Model"}
          </div>
          {!isLoading && selectedModelData && (
            <div className="text-[10px] text-slate-500 truncate">
              {selectedModelData.provider}
            </div>
          )}
        </div>
        {selectedModelData?.isDefault && (
          <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
            DEFAULT
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                🤖 AI Model Selection
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                style={{ fontFamily: '"Ark Pixel", monospace' }}
              />
            </div>

            {/* Provider filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedProvider(null)}
                className={`px-2 py-1 text-[10px] rounded transition-colors ${
                  !selectedProvider
                    ? "bg-white text-black"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All
              </button>
              {providers.map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    selectedProvider === provider
                      ? "bg-white text-black"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          {/* Models list */}
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div
                  className="px-4 py-2 text-xs font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: `${PROVIDER_COLORS[provider] || "#64748B"}15`,
                    color: PROVIDER_COLORS[provider] || "#94A3B8",
                    fontFamily: '"Ark Pixel", monospace'
                  }}
                >
                  <Cpu className="w-3 h-3" />
                  {provider}
                  <span className="text-slate-500 ml-auto">{providerModels.length}</span>
                </div>
                {providerModels.map((model) => {
                  const isSelected = selectedModel === model.id;
                  const modelColor = PROVIDER_COLORS[model.provider] || "#64748B";

                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSelect(model)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors border-l-2 ${
                        isSelected
                          ? "bg-slate-800/80 border-l-green-500"
                          : "border-l-transparent hover:border-l-slate-600"
                      }`}
                    >
                      {/* Model icon */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${modelColor}20` }}
                      >
                        <Code className="w-5 h-5" style={{ color: modelColor }} />
                      </div>

                      {/* Model info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-sm font-medium text-white"
                            style={{ fontFamily: '"Ark Pixel", monospace' }}
                          >
                            {model.name || model.id.split("/").pop()}
                          </span>
                          {model.isDefault && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>

                        {model.description && (
                          <div className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {model.description}
                          </div>
                        )}

                        {/* Badges */}
                        {model.badges && model.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {model.badges.map((badge) => (
                              <span
                                key={badge}
                                className={`px-1.5 py-0.5 text-[10px] rounded border ${
                                  BADGE_COLORS[badge] || "bg-slate-700 text-slate-300 border-slate-600"
                                }`}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Context window */}
                        {model.contextWindow && (
                          <div className="text-[10px] text-slate-500">
                            {Math.round(model.contextWindow / 1000)}k context window
                          </div>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-black" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredModels.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-slate-500 text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                  No models found
                </div>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedProvider(null);
                  }}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{models.length} models available</span>
              <span>Default: Qwen Coder</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
