import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/** Shared model ID — change here to update everywhere. */
export const GROQ_MODEL = "qwen/qwen3.6-27b";

type CreateParams = Parameters<typeof groq.chat.completions.create>[0];

/**
 * Calls groq.chat.completions.create with exponential backoff on 429s.
 * Retries up to maxRetries times, waiting retryDelayMs * 2^attempt ms each time.
 */
export async function groqWithRetry(
  params: CreateParams,
  maxRetries = 3,
  retryDelayMs = 8000
): Promise<Groq.Chat.ChatCompletion> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await groq.chat.completions.create(params) as Groq.Chat.ChatCompletion;
    } catch (err: unknown) {
      lastError = err;
      const groqErr = err as { status?: number };

      if (groqErr.status === 429 && attempt < maxRetries) {
        const waitMs = retryDelayMs * Math.pow(2, attempt); // 8s, 16s, 32s
        console.warn(`[groq] 429 rate limit hit — retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((res) => setTimeout(res, waitMs));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}
