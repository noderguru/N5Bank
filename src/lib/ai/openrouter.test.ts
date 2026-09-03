import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  callOpenRouterStructured,
  isOpenRouterConfigured,
  clearOpenRouterCache,
} from "./openrouter";

describe("OpenRouter Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    clearOpenRouterCache();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns null immediately when OPENROUTER_API_KEY is not set or empty", async () => {
    delete process.env.OPENROUTER_API_KEY;

    expect(isOpenRouterConfigured()).toBe(false);

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await callOpenRouterStructured({
      prompt: "Test prompt",
    });

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports configured when a valid key is provided in environment", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";
    expect(isOpenRouterConfigured()).toBe(true);
  });

  it("aborts when the request exceeds the specified timeout and returns null without throwing", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";

    // Simulate fetch hanging longer than timeoutMs
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, options) => {
      return new Promise((_, reject) => {
        const signal = options?.signal as AbortSignal | undefined;
        signal?.addEventListener("abort", () => {
          const err = new Error("This operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const start = Date.now();
    const result = await callOpenRouterStructured({
      prompt: "Slow request",
      timeoutMs: 50,
      bypassCache: true,
    });
    const duration = Date.now() - start;

    expect(result).toBeNull();
    expect(duration).toBeLessThan(1000); // Definitely aborted around 50ms, didn't hang
  });

  it("gracefully catches and returns null when model returns invalid non-JSON string", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "I am unable to output JSON: here is a poem instead.",
            },
          },
        ],
      }),
    } as Response);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await callOpenRouterStructured({
      prompt: "Output JSON",
      bypassCache: true,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[OpenRouter] Failed to parse model output as JSON"),
      expect.anything()
    );
  });

  it("handles HTTP errors (e.g. 401 / 429 / 500) and returns null safely", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await callOpenRouterStructured({
      prompt: "Fail me",
      bypassCache: true,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[OpenRouter] HTTP error 401")
    );
  });

  it("caches successful responses and avoids duplicate network requests", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ match: true, confidence: 0.95 }),
            },
          },
        ],
      }),
    } as Response);

    const first = await callOpenRouterStructured<{ match: boolean; confidence: number }>({
      prompt: "Repeatable prompt",
    });

    expect(first).toEqual({ match: true, confidence: 0.95 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call with same parameters should hit in-memory cache
    const second = await callOpenRouterStructured<{ match: boolean; confidence: number }>({
      prompt: "Repeatable prompt",
    });

    expect(second).toEqual({ match: true, confidence: 0.95 });
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Not called again!
  });

  it("sanitizes markdown-wrapped JSON responses (```json ... ```)", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "```json\n{\"clean\": true}\n```",
            },
          },
        ],
      }),
    } as Response);

    const result = await callOpenRouterStructured<{ clean: boolean }>({
      prompt: "Wrap in markdown",
      bypassCache: true,
    });

    expect(result).toEqual({ clean: true });
  });

  it("returns null when validator rejects model payload", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-fake-testing-key-123456";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ score: "not-a-number" }),
            },
          },
        ],
      }),
    } as Response);

    const result = await callOpenRouterStructured({
      prompt: "Validate me",
      bypassCache: true,
      validate: (data: unknown) => {
        const record = data as Record<string, unknown> | null;
        if (typeof record?.score === "number") return record;
        return null;
      },
    });

    expect(result).toBeNull();
  });
});
