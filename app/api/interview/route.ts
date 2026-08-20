import { groqWithRetry, GROQ_MODEL } from "@/lib/groq-client";
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

    if (!process.env.GROQ_API_KEY) {
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
      max_tokens: 512,
      response_format: { type: "json_object" },
      // @ts-expect-error: groq-sdk types don't expose reasoning_effort yet
      reasoning_effort: "none",
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI." },
        { status: 502 }
      );
    }

    const result = JSON.parse(content);

    return Response.json(result);
  } catch (error: unknown) {
    console.error("Interview API error:", error);

    const groqError = error as { status?: number };
    if (groqError.status === 429) {
      return Response.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
