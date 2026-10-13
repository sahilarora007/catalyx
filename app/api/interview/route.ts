import { groqWithRetry, GROQ_MODEL, safeParseJson } from "@/lib/groq-client";
import { INTERVIEW_SYSTEM_PROMPT, buildInterviewUserPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { initialPrompt, answers } = await request.json();

    if (!initialPrompt || !Array.isArray(answers)) {
      return Response.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    const completion = await groqWithRetry({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: INTERVIEW_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildInterviewUserPrompt(initialPrompt, answers),
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI." },
        { status: 502 }
      );
    }

    const result = safeParseJson(content);

    return Response.json(result);
  } catch (error: unknown) {
    console.error("Interview API error:", error);

    const aiError = error as { status?: number };
    if (aiError.status === 429) {
      return Response.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: (error as Error)?.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
