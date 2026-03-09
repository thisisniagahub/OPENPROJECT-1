/**
 * Environment configuration validation.
 * Validates all required and optional environment variables at startup.
 */

import { z } from "zod";

// Environment schema
const envSchema = z.object({
  // Gateway configuration
  NEXT_PUBLIC_GATEWAY_URL: z.string().url().optional(),
  NEXT_PUBLIC_GATEWAY_TOKEN: z.string().optional(),
  
  // API configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_SOUND: z.string().transform(v => v === "true").optional(),
  NEXT_PUBLIC_ENABLE_MUSIC: z.string().transform(v => v === "true").optional(),
  
  // Debug mode
  NEXT_PUBLIC_DEBUG: z.string().transform(v => v === "true").optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Default values
const DEFAULTS: Partial<EnvConfig> = {
  NEXT_PUBLIC_GATEWAY_URL: "ws://127.0.0.1:18789",
  NEXT_PUBLIC_GATEWAY_TOKEN: "",
  NEXT_PUBLIC_API_URL: "",
  NEXT_PUBLIC_ENABLE_SOUND: true,
  NEXT_PUBLIC_ENABLE_MUSIC: true,
  NEXT_PUBLIC_DEBUG: false,
};

// Parse and validate environment
function parseEnv(): EnvConfig {
  const rawEnv = {
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    NEXT_PUBLIC_GATEWAY_TOKEN: process.env.NEXT_PUBLIC_GATEWAY_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENABLE_SOUND: process.env.NEXT_PUBLIC_ENABLE_SOUND,
    NEXT_PUBLIC_ENABLE_MUSIC: process.env.NEXT_PUBLIC_ENABLE_MUSIC,
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  };

  // Remove undefined values
  const definedEnv = Object.fromEntries(
    Object.entries(rawEnv).filter(([, v]) => v !== undefined)
  );

  try {
    const parsed = envSchema.parse(definedEnv);
    return { ...DEFAULTS, ...parsed } as EnvConfig;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Env] Validation warning:", error);
    }
    return { ...DEFAULTS, ...definedEnv } as EnvConfig;
  }
}

// Exported singleton
export const env = parseEnv();

// Helper functions
export function getGatewayUrl(): string {
  return env.NEXT_PUBLIC_GATEWAY_URL || DEFAULTS.NEXT_PUBLIC_GATEWAY_URL || "ws://127.0.0.1:18789";
}

export function getGatewayToken(): string {
  return env.NEXT_PUBLIC_GATEWAY_TOKEN || "";
}

export function isDebugEnabled(): boolean {
  return env.NEXT_PUBLIC_DEBUG ?? false;
}

export function isSoundEnabled(): boolean {
  return env.NEXT_PUBLIC_ENABLE_SOUND ?? true;
}

export function isMusicEnabled(): boolean {
  return env.NEXT_PUBLIC_ENABLE_MUSIC ?? true;
}
