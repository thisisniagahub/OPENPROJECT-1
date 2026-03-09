import { NextRequest, NextResponse } from "next/server";

// Available AI models configuration
const AVAILABLE_MODELS = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    description: "Best for complex tasks, coding, and analysis",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    description: "Most capable for highly complex tasks",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    description: "Fast and capable multimodal model",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    description: "High performance for complex tasks",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "google",
    contextWindow: 32000,
    description: "Google's multimodal model",
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");

  let models = AVAILABLE_MODELS;
  
  if (provider) {
    models = models.filter(m => m.provider === provider);
  }

  return NextResponse.json({
    models,
    total: models.length,
    defaultModel: "claude-3-5-sonnet",
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
