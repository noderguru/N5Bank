import { createHash } from "node:crypto";

export interface OpenRouterStructuredCallOptions<T> {
  prompt: string;
  systemPrompt?: string;
  schemaDescription?: string;
  jsonSchema?: Record<string, unknown>;
  validate?: (parsed: unknown) => T | null;
  timeoutMs?: number;
  model?: string;
  bypassCache?: boolean;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// In-memory cache to prevent burning tokens during demo navigation
const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 200;

export function clearOpenRouterCache(): void {
  responseCache.clear();
}

export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return Boolean(key && key.length > 5);
}

function getCacheKey(payload: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function setCache(key: string, data: unknown): void {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
}

function getFromCache<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Executes a structured AI call via OpenRouter with strict timeout, caching, and fallback guarantee.
 *
 * Resilience invariants:
 * 1. NEVER throws an exception. Returns null on any failure (no key, timeout, rate limit, parse error).
 * 2. Strict timeout (default: 8s) ensures pages never hang.
 * 3. Secret API key is read strictly server-side and never forwarded or leaked.
 */
export async function callOpenRouterStructured<T = unknown>(
  options: OpenRouterStructuredCallOptions<T>
): Promise<T | null> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const model =
    options.model || process.env.OPENROUTER_MODEL || "z-ai/glm-5.3-flash";
  const timeoutMs = options.timeoutMs ?? 8000;

  const messages = [
    {
      role: "system",
      content: [
        options.systemPrompt ||
          "You are a helpful AI assistant for the N5Deal financial M&A marketplace.",
        "Always respond with valid JSON only. Do not include markdown code blocks, backticks, or introductory conversational text.",
        options.schemaDescription
          ? `Adhere strictly to this JSON structure:\n${options.schemaDescription}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    {
      role: "user",
      content: options.prompt,
    },
  ];

  const cacheKey = getCacheKey({
    model,
    messages,
    schema: options.jsonSchema,
    schemaDesc: options.schemaDescription,
  });

  if (!options.bypassCache) {
    const cached = getFromCache<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    };

    if (options.jsonSchema) {
      requestBody.response_format = {
        type: "json_schema",
        json_schema: {
          name: "output_schema",
          strict: true,
          schema: options.jsonSchema,
        },
      };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "N5Deal M&A Marketplace",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `[OpenRouter] HTTP error ${response.status}: ${response.statusText}`
      );
      return null;
    }

    const json = await response.json();
    const rawContent = json?.choices?.[0]?.message?.content;

    if (!rawContent || typeof rawContent !== "string") {
      console.warn("[OpenRouter] Empty or malformed choice content returned");
      return null;
    }

    // Sanitize in case model included markdown fence ```json ... ```
    const cleaned = rawContent
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn("[OpenRouter] Failed to parse model output as JSON:", parseError);
      return null;
    }

    if (options.validate) {
      const validated = options.validate(parsed);
      if (validated === null) {
        console.warn("[OpenRouter] Structured validation failed for model response");
        return null;
      }
      setCache(cacheKey, validated);
      return validated;
    }

    setCache(cacheKey, parsed);
    return parsed as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[OpenRouter] Call timed out after ${timeoutMs}ms`);
    } else {
      console.warn("[OpenRouter] Unexpected error during completion:", error);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
