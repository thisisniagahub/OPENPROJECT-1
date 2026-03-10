"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Play, Clock, Star, Copy, Search } from "lucide-react";

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  isFavorite: boolean;
}

interface TaskTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: "code-review",
    name: "Code Review",
    description: "Review code for bugs, improvements, and best practices",
    prompt: "Please review the following code and provide feedback on: 1) Potential bugs or issues, 2) Performance improvements, 3) Code style and best practices, 4) Security concerns",
    category: "Development",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: true,
  },
  {
    id: "bug-fix",
    name: "Bug Fix Analysis",
    description: "Analyze and fix a bug in your code",
    prompt: "I'm encountering a bug. Please help me: 1) Identify the root cause, 2) Suggest a fix, 3) Explain why the bug occurred, 4) Recommend how to prevent similar issues",
    category: "Development",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: true,
  },
  {
    id: "feature-implementation",
    name: "Feature Implementation",
    description: "Get help implementing a new feature",
    prompt: "I need to implement a new feature. Please help me: 1) Plan the implementation approach, 2) Write the code, 3) Add appropriate tests, 4) Document the changes",
    category: "Development",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: false,
  },
  {
    id: "api-design",
    name: "API Design",
    description: "Design and document REST APIs",
    prompt: "Help me design a REST API with: 1) Endpoint definitions, 2) Request/Response schemas, 3) Authentication requirements, 4) Error handling, 5) API documentation",
    category: "Architecture",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: false,
  },
  {
    id: "test-generation",
    name: "Generate Tests",
    description: "Generate unit tests for your code",
    prompt: "Generate comprehensive unit tests for the following code. Include: 1) Happy path tests, 2) Edge cases, 3) Error handling tests, 4) Mock setup if needed",
    category: "Testing",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: true,
  },
  {
    id: "refactor",
    name: "Refactor Code",
    description: "Improve code structure and readability",
    prompt: "Refactor the following code to improve: 1) Readability, 2) Maintainability, 3) Performance, 4) Adherence to best practices. Explain each change made.",
    category: "Development",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: false,
  },
  {
    id: "documentation",
    name: "Write Documentation",
    description: "Generate documentation for code or APIs",
    prompt: "Create documentation for the following code including: 1) Overview and purpose, 2) Usage examples, 3) Parameters and return values, 4) Edge cases and error handling",
    category: "Documentation",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: false,
  },
  {
    id: "debug-async",
    name: "Debug Async Issues",
    description: "Debug async/await and Promise issues",
    prompt: "Help me debug the following async code. Look for: 1) Race conditions, 2) Unhandled promise rejections, 3) Incorrect async flow, 4) Memory leaks in async operations",
    category: "Development",
    createdAt: new Date().toISOString(),
    useCount: 0,
    isFavorite: false,
  },
];

const STORAGE_KEY = "agent-town:task-templates";

function loadTemplates(): TaskTemplate[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return [...DEFAULT_TEMPLATES, ...parsed.filter((t: TaskTemplate) => !DEFAULT_TEMPLATES.find(d => d.id === t.id))];
    } catch {
      return DEFAULT_TEMPLATES;
    }
  }
  return DEFAULT_TEMPLATES;
}

function saveTemplates(templates: TaskTemplate[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

const CATEGORY_COLORS: Record<string, string> = {
  Development: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Architecture: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Testing: "bg-green-500/20 text-green-400 border-green-500/30",
  Documentation: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Custom: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function TaskTemplates({ isOpen, onClose, onSelectTemplate }: TaskTemplatesProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    name: "",
    description: "",
    prompt: "",
    category: "Custom",
  });

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(templates.map((t) => t.category))];

  const handleSelect = (template: TaskTemplate) => {
    const updated = templates.map((t) =>
      t.id === template.id
        ? { ...t, useCount: t.useCount + 1, lastUsed: new Date().toISOString() }
        : t
    );
    setTemplates(updated);
    saveTemplates(updated);
    onSelectTemplate(template);
    onClose();
  };

  const handleToggleFavorite = (id: string) => {
    const updated = templates.map((t) =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleDelete = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleCreate = () => {
    if (!newTemplate.name || !newTemplate.prompt) return;

    const template: TaskTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description || "",
      prompt: newTemplate.prompt,
      category: newTemplate.category || "Custom",
      createdAt: new Date().toISOString(),
      useCount: 0,
      isFavorite: false,
    };

    const updated = [...templates, template];
    setTemplates(updated);
    saveTemplates(updated);
    setShowCreate(false);
    setNewTemplate({ name: "", description: "", prompt: "", category: "Custom" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: '"Ark Pixel", monospace' }}>
              📋 Task Templates
            </h2>
            <p className="text-xs text-slate-400">
              Quick-start your tasks with pre-defined templates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Plus size={16} />
              <span className="text-xs">New Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  !selectedCategory ? "bg-white text-black" : "bg-slate-700 text-slate-300"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedCategory === cat ? "bg-white text-black" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {showCreate ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-4">Create New Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={newTemplate.name || ""}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Template name..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Description</label>
                  <input
                    type="text"
                    value={newTemplate.description || ""}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Brief description..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Prompt</label>
                  <textarea
                    value={newTemplate.prompt || ""}
                    onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                    placeholder="Enter the task prompt..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-green-500 text-black text-sm rounded-lg hover:bg-green-400 transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{template.name}</h3>
                        {template.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          CATEGORY_COLORS[template.category] || CATEGORY_COLORS.Custom
                        }`}
                      >
                        {template.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Used {template.useCount}x
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleFavorite(template.id)}
                        className="p-1.5 hover:bg-slate-700 rounded"
                        title="Toggle favorite"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            template.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-slate-400"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleSelect(template)}
                        className="p-1.5 hover:bg-slate-700 rounded text-green-400"
                        title="Use template"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      {!DEFAULT_TEMPLATES.find((d) => d.id === template.id) && (
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 hover:bg-slate-700 rounded text-red-400"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  No templates found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
