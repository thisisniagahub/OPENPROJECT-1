"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Cpu, Search, Check } from "lucide-react";
import { useStudio } from "@/lib/store";
import type { ModelChoice } from "@/lib/gateway-handler";

interface ModelSelectorProps {
  onModelSelect?: (model: ModelChoice) => void;
}

export default function ModelSelector({ onModelSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [models, setModels] = useState<ModelChoice[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { state } = useStudio();
  const isConnected = state.connection === "connected";

  useEffect(() => {
    if (isConnected && models.length === 0) {
      fetchModels();
    }
  }, [isConnected]);

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

  const handleSelect = useCallback((model: ModelChoice) => {
    setSelectedModel(model.id);
    setIsOpen(false);
    setSearch("");
    onModelSelect?.(model);
  }, [onModelSelect]);

  const filteredModels = models.filter((model) =>
    model.id.toLowerCase().includes(search.toLowerCase()) ||
    model.provider.toLowerCase().includes(search.toLowerCase())
  );

  // Group models by provider
  const groupedModels = filteredModels.reduce((acc, model) => {
    const provider = model.provider || "Unknown";
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, ModelChoice[]>);

  const selectedModelData = models.find((m) => m.id === selectedModel);

  if (!isConnected) {
    return (
      <div className="px-3 py-2 text-slate-500 text-xs" style={{ fontFamily: '"Ark Pixel", monospace' }}>
        Connect to select model
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:border-purple-500 transition-colors min-w-[180px]"
      >
        <Cpu className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-white truncate flex-1 text-left" style={{ fontFamily: '"Ark Pixel", monospace' }}>
          {isLoading ? "Loading..." : selectedModelData?.id.split("/").pop() || "Select Model"}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                style={{ fontFamily: '"Ark Pixel", monospace' }}
              />
            </div>
          </div>

          {/* Models list */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-3 py-1.5 text-xs text-slate-400 bg-slate-800/50 font-medium" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                  {provider}
                </div>
                {providerModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-800 transition-colors ${
                      selectedModel === model.id ? "bg-purple-500/20" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                        {model.id.split("/").pop()}
                      </div>
                      {model.contextWindow && (
                        <div className="text-xs text-slate-500">
                          {Math.round(model.contextWindow / 1000)}k context
                        </div>
                      )}
                    </div>
                    {selectedModel === model.id && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            ))}

            {filteredModels.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-slate-500" style={{ fontFamily: '"Ark Pixel", monospace' }}>
                No models found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
