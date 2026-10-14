/**
 * Catalyx AI — LLM Client (OpenRouter & Fallback)
 * Model: google/gemma-4-26b-a4b-it:free
 */

export const GROQ_MODEL = "google/gemma-4-26b-a4b-it:free";
export const AI_MODEL = "google/gemma-4-26b-a4b-it:free";

/** Fallback models on OpenRouter (max 3 allowed by OpenRouter API) */
const FALLBACK_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
];

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role?: string;
    };
  }>;
  model?: string;
}

/**
 * Safely parse JSON from LLM output, extracting from markdown codeblocks or raw braces if needed.
 */
export function safeParseJson<T = Record<string, unknown>>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or non-string response from AI");
  }

  // 1. Strip markdown fences like ```json ... ``` or ``` ... ```
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // 2. Try direct JSON.parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 3. Fallback: extract substring between first and last brace
    let target = cleaned;
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      target = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(target) as T;
      } catch {
        // Continue to repair
      }
    }

    // 4. Fallback: repair unescaped newlines/tabs/control characters inside string values
    try {
      let inString = false;
      let isEscaped = false;
      let repaired = "";

      for (let i = 0; i < target.length; i++) {
        const char = target[i];

        if (inString) {
          if (isEscaped) {
            repaired += char;
            isEscaped = false;
          } else if (char === "\\") {
            repaired += char;
            isEscaped = true;
          } else if (char === '"') {
            repaired += char;
            inString = false;
          } else if (char === "\n") {
            repaired += "\\n";
          } else if (char === "\r") {
            repaired += "\\r";
          } else if (char === "\t") {
            repaired += "\\t";
          } else {
            repaired += char;
          }
        } else {
          if (char === '"') {
            inString = true;
          }
          repaired += char;
        }
      }

      // Auto-close open structures if truncated
      let openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
      let openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
      if (inString) repaired += '"';
      while (openBrackets > 0) { repaired += "]"; openBrackets--; }
      while (openBraces > 0) { repaired += "}"; openBraces--; }

      return JSON.parse(repaired) as T;
    } catch {
      throw new Error("Failed to parse valid JSON from AI response");
    }
  }
}

/**
 * Calls OpenRouter chat completions API with exponential backoff on 429/5xx.
 */
export async function groqWithRetry(
  params: ChatCompletionParams,
  maxRetries = 3,
  retryDelayMs = 2500
): Promise<ChatCompletionResponse> {
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("API key not configured. Please set OPENROUTER_API_KEY.");
  }

  // Prepare payload for OpenRouter
  const bodyPayload: Record<string, unknown> = {
    models: FALLBACK_MODELS,
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.max_tokens ?? 10000,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://catalyx.ai",
          "X-Title": "Catalyx AI",
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP ${response.status}`;
        const errorStatus = response.status;

        // If rate-limited or server error, retry with backoff
        if ((errorStatus === 429 || errorStatus >= 500) && attempt < maxRetries) {
          const waitMs = retryDelayMs * Math.pow(2, attempt);
          console.warn(
            `[openrouter] HTTP ${errorStatus} (${errorMsg}) — retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`
          );
          await new Promise((res) => setTimeout(res, waitMs));
          continue;
        }

        const err = new Error(errorMsg) as Error & { status?: number };
        err.status = errorStatus;
        throw err;
      }

      if (!data.choices || !data.choices[0]?.message) {
        throw new Error("Invalid response format received from AI provider.");
      }

      const msg = data.choices[0].message;
      if (!msg.content && msg.reasoning) {
        msg.content = msg.reasoning;
      }

      return data as ChatCompletionResponse;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;

      if ((status === 429 || !status) && attempt < maxRetries) {
        const waitMs = retryDelayMs * Math.pow(2, attempt);
        console.warn(`[openrouter] Retry attempt ${attempt + 1}/${maxRetries} after ${waitMs}ms...`);
        await new Promise((res) => setTimeout(res, waitMs));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}
