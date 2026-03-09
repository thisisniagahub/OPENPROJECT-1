import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("/api/models", () => {
  describe("GET", () => {
    it("should return all models", async () => {
      const request = new NextRequest(new URL("http://localhost/api/models"));
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.models).toBeDefined();
      expect(data.models.length).toBeGreaterThan(0);
      expect(data.total).toBe(data.models.length);
    });

    it("should return default model as qwen-portal/coder-model", async () => {
      const request = new NextRequest(new URL("http://localhost/api/models"));
      const response = await GET(request);
      const data = await response.json();

      expect(data.defaultModel).toBe("qwen-portal/coder-model");
    });

    it("should filter models by provider", async () => {
      const url = new URL("http://localhost/api/models?provider=qwen-portal");
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.models.forEach((model: { provider: string }) => {
        expect(model.provider).toBe("qwen-portal");
      });
    });

    it("should return providers list", async () => {
      const request = new NextRequest(new URL("http://localhost/api/models"));
      const response = await GET(request);
      const data = await response.json();

      expect(data.providers).toBeDefined();
      expect(data.providers).toContain("qwen-portal");
      expect(data.providers).toContain("anthropic");
      expect(data.providers).toContain("openai");
    });

    it("should have qwen-portal/coder-model as recommended/default", async () => {
      const request = new NextRequest(new URL("http://localhost/api/models"));
      const response = await GET(request);
      const data = await response.json();

      const qwenCoder = data.models.find(
        (m: { id: string }) => m.id === "qwen-portal/coder-model"
      );
      expect(qwenCoder).toBeDefined();
      expect(qwenCoder.isDefault).toBe(true);
      expect(qwenCoder.badges).toContain("Recommended");
    });

    it("should have required model properties", async () => {
      const request = new NextRequest(new URL("http://localhost/api/models"));
      const response = await GET(request);
      const data = await response.json();

      data.models.forEach((model: Record<string, unknown>) => {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("contextWindow");
        expect(model).toHaveProperty("description");
      });
    });
  });

  describe("POST", () => {
    it("should validate model selection", async () => {
      const request = new NextRequest("http://localhost/api/models", {
        method: "POST",
        body: JSON.stringify({ modelId: "qwen-portal/coder-model" }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.model.id).toBe("qwen-portal/coder-model");
    });

    it("should return 400 for missing modelId", async () => {
      const request = new NextRequest("http://localhost/api/models", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should return 404 for invalid modelId", async () => {
      const request = new NextRequest("http://localhost/api/models", {
        method: "POST",
        body: JSON.stringify({ modelId: "invalid-model" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(404);
    });
  });
});
