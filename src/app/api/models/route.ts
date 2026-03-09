import { NextRequest, NextResponse } from "next/server";

// Available AI models configuration
const AVAILABLE_MODELS = [
  {
    id: "qwen-portal/coder-model",
    name: "Qwen Coder",
    provider: "qwen-portal",
    contextWindow: 128000,
    description: "Advanced coding model optimized for development tasks",
    capabilities: ["code-generation", "code-analysis", "debugging", "refactoring"],
    isDefault: true,
    badges: ["Recommended", "Coding"],
  },
  {
    id: "qwen-portal/qwen-2.5-72b",
    name: "Qwen 2.5 72B",
    provider: "qwen-portal",
    contextWindow: 131072,
    description: "Large language model for complex reasoning tasks",
    capabilities: ["reasoning", "analysis", "multilingual"],
    isDefault: false,
    badges: ["Large Model"],
  },
  {
    id: "qwen-portal/qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    provider: "qwen-portal",
    contextWindow: 131072,
    description: "Efficient coding model for fast development",
    capabilities: ["code-generation", "code-review", "testing"],
    isDefault: false,
    badges: ["Fast", "Coding"],
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    description: "Best for complex tasks, coding, and analysis",
    capabilities: ["reasoning", "coding", "analysis"],
    isDefault: false,
    badges: ["Premium"],
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    description: "Most capable for highly complex tasks",
    capabilities: ["complex-reasoning", "research", "creative"],
    isDefault: false,
    badges: ["Premium", "Advanced"],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    description: "Fast and capable multimodal model",
    capabilities: ["multimodal", "coding", "reasoning"],
    isDefault: false,
    badges: ["Multimodal"],
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    description: "High performance for complex tasks",
    capabilities: ["reasoning", "coding", "analysis"],
    isDefault: false,
    badges: ["Fast"],
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    contextWindow: 1000000,
    description: "Google's fastest multimodal model with 1M context",
    capabilities: ["multimodal", "fast", "large-context"],
    isDefault: false,
    badges: ["Fast", "1M Context"],
  },
  {
    id: "deepseek-coder-v3",
    name: "DeepSeek Coder V3",
    provider: "deepseek",
    contextWindow: 64000,
    description: "Specialized coding model with strong performance",
    capabilities: ["code-generation", "debugging", "code-analysis"],
    isDefault: false,
    badges: ["Coding", "Open Source"],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const capability = searchParams.get("capability");

  let models = AVAILABLE_MODELS;

  if (provider) {
    models = models.filter(m => m.provider === provider);
  }

  if (capability) {
    models = models.filter(m => m.capabilities?.includes(capability));
  }

  // Find default model
  const defaultModel = models.find(m => m.isDefault)?.id || "qwen-portal/coder-model";

  return NextResponse.json({
    models,
    total: models.length,
    defaultModel,
    providers: [...new Set(AVAILABLE_MODELS.map(m => m.provider))],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: "modelId is required" },
        { status: 400 }
      );
    }

    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!model) {
      return NextResponse.json(
        { error: `Model ${modelId} not found` },
        { status: 404 }
      );
    }

    // In real implementation, this would set the model in the gateway
    return NextResponse.json({
      success: true,
      model,
      message: `Model set to ${model.name}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
