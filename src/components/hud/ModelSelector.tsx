"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Cpu, Search, Check, Zap, Code, Brain, Sparkles, Star, X } from "lucide-react";
import { useStudio } from "@/lib/store";
import type { ModelChoice } from "@/lib/gateway-types";

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

  const { state, fetchModels: loadGatewayModels, selectModel } = useStudio();
  const isConnected = state.connection === "connected";

  const loadModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const available = await loadGatewayModels();
      setModels(available);
      if (!selectedModel && available[0]?.id) {
        setSelectedModel(available[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setIsLoading(false);
    }
  }, [loadGatewayModels, selectedModel]);

  useEffect(() => {
    if (isConnected && models.length === 0) {
      void loadModels();
    }
  }, [isConnected, models.length, loadModels]);

  useEffect(() => {
    if (state.sessionMetrics.model) {
      setSelectedModel(state.sessionMetrics.model);
    }
  }, [state.sessionMetrics.model]);

  const handleSelect = useCallback(async (model: ExtendedModelChoice) => {
    const applied = await selectModel(model.id);
    if (!applied) return;
    setSelectedModel(model.id);
    setIsOpen(false);
    setSearch("");
    onModelSelect?.(model);
  }, [onModelSelect, selectModel]);

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
      <div className="px-2 py-1 border border-red-900 bg-red-900/10 text-red-500 text-[8px] font-black uppercase tracking-widest text-center min-w-[120px]">
        UPLINK OFFLINE

      </div>
    );
  }

  return (
    <div className="relative pointer-events-auto">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-2 py-1.5 bg-[#02050a] border border-cyan-500/50 hover:border-cyan-400 hover:bg-[#050a15] transition-colors min-w-[150px]"
      >
        <Cpu className="w-3 h-3 text-cyan-500" />
        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 truncate flex-1 text-left">
          {isLoading ? "SCANNING..." : selectedModelData?.id.split("/").pop() || "SELECT CORE"}
        </span>
        <ChevronDown className={`w-3 h-3 text-cyan-700 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full mb-1 right-0 w-64 bg-[#050a15] border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)] z-[100] flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-cyan-900 bg-[#02050a]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="QUERY CORES..."
                className="pixel-input w-full pl-6 text-[8px] py-1"
              />
            </div>

            {/* Provider filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedProvider(null)}
                className={`px-2 py-1 text-[10px] rounded transition-colors ${!selectedProvider
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
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${selectedProvider === provider
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
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-2 py-1 text-[7px] font-black text-slate-500 uppercase tracking-widest bg-[#0a0f1c] border-y border-slate-800 flex justify-between">
                  <span>{provider}</span>
                  <span className="text-slate-500">{providerModels.length}</span>
                </div>
                {providerModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-left border-l-2 transition-colors ${selectedModel === model.id
                      ? "bg-cyan-500/10 border-cyan-400"
                      : "border-transparent hover:bg-cyan-900/30 hover:border-cyan-700"
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-[8px] font-bold uppercase tracking-widest truncate ${selectedModel === model.id ? "text-cyan-400" : "text-slate-300"
                        }`}>
                        {model.id.split("/").pop()}
                      </div>
                      {model.contextWindow && (
                        <div className="text-[7px] font-mono text-cyan-700 mt-0.5">
                          CTX: {Math.round(model.contextWindow / 1000)}K
                        </div>
                      )}
                    </div>
                    {selectedModel === model.id && (
                      <Check className="w-3 h-3 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            ))}

            {filteredModels.length === 0 && (
              <div className="py-4 text-center text-[8px] font-black uppercase tracking-widest text-cyan-900">
                NO CORES FOUND
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-2 py-1 border-t border-cyan-900 bg-[#02050a]">
            <div className="flex items-center justify-between text-[7px] font-mono text-cyan-700">
              <span>{models.length} CORES</span>
              <span>DEFAULT: QWEN</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
