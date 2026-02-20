import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { studySetTitle, totalQuestions, playerCorrect: correctCount, missedQuestions, winner } = body;

    const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const resultLabel = winner === "player" ? "Student won the battle!" : winner === "draw" ? "Battle ended in a draw." : "Student lost the battle.";

    const missedSection =
      missedQuestions.length === 0
        ? "The student answered every question correctly."
        : missedQuestions
            .map(
              (m, i) =>
                `${i + 1}. Question: ${m.question}\n   Correct answer: ${m.correctAnswer}${m.explanation ? `\n   Note: ${m.explanation}` : ""}`
            )
            .join("\n\n");

    const prompt = `You are a friendly, concise study coach reviewing a student's quiz battle results.

Topic: ${studySetTitle}
Score: ${correctCount}/${totalQuestions} (${pct}%)
${resultLabel}

${missedQuestions.length > 0 ? `Questions the student got wrong:\n${missedSection}` : missedSection}

Write a short post-game study report in plain text. No markdown, no asterisks. Use these exact section labels followed by a colon and newline:

PERFORMANCE SUMMARY:
[2-3 sentences: honest, encouraging assessment of their score and what it says about their understanding]

WHAT YOU MISSED:
[For each wrong question: one short paragraph explaining the concept and why the correct answer is right. If they got everything right, say so.]

TOPICS TO REVIEW:
[2-4 bullet points starting with a dash, listing specific concepts or topics worth revisiting]

STUDY TIP:
[One short, actionable tip for studying this topic more effectively]

Be specific to the subject matter. Keep each section brief. Sound like a coach, not a textbook.`;

    const stream = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[game-report]", err);
    return Response.json({ error: err.message || "Failed to generate report." }, { status: 500 });
  }
}
