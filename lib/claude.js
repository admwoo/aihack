import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a quiz question generator. Given study material, return ONLY a valid JSON array of question objects. No markdown fences, no explanation, no text outside the JSON array.

Each question must follow this schema exactly:

For multiple_choice:
{ "type": "multiple_choice", "question": "...", "answers": [{"id":"a","text":"...","isCorrect":false},{"id":"b","text":"...","isCorrect":true},{"id":"c","text":"...","isCorrect":false},{"id":"d","text":"...","isCorrect":false}], "explanation": "..." }
Rules: exactly 4 answers, exactly 1 isCorrect:true.

For true_false:
{ "type": "true_false", "question": "...", "answers": [{"id":"true","text":"True","isCorrect":true},{"id":"false","text":"False","isCorrect":false}], "explanation": "..." }
Rules: exactly 2 answers, exactly 1 isCorrect:true.

For short_answer:
{ "type": "short_answer", "question": "...", "answers": [], "modelAnswer": "...", "explanation": "..." }
Rules: answers must be empty array, modelAnswer must be a concise but complete answer.

Return the questions as a raw JSON array. Do not wrap in any object.`;

/**
 * Generates quiz questions from study text using Claude.
 * @param {string} text - Extracted study material text
 * @param {{ count: number, types: string[] }} opts
 * @returns {Promise<object[]>} Array of question objects with assigned IDs
 */
export async function generateQuestions(text, { count = 10, types = ["multiple_choice"] }) {
  const typeList = types.join(", ");
  const truncatedText = text.slice(0, 80000); // stay well within context limits

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate exactly ${count} quiz questions from the study material below.
Question types to include (mix them proportionally): ${typeList}.
Return ONLY a JSON array.

Study material:
${truncatedText}`,
      },
    ],
  });

  const raw = message.content[0].text.trim();

  // Strip markdown fences if Claude adds them despite instructions
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let questions;
  try {
    questions = JSON.parse(jsonText);
  } catch {
    throw new Error(`Claude returned invalid JSON: ${jsonText.slice(0, 200)}`);
  }

  if (!Array.isArray(questions)) {
    throw new Error("Claude response was not a JSON array");
  }

  // Assign stable UUIDs to each question and answer
  return questions.map((q) => ({
    ...q,
    id: crypto.randomUUID(),
    answers: (q.answers || []).map((a) => ({
      ...a,
      id: a.id ?? crypto.randomUUID(),
    })),
  }));
}
