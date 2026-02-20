import { extractTextFromPDF } from "@/lib/pdf";
import { generateQuestions } from "@/lib/claude";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const source = formData.get("source"); // "pdf" | "text"
    const title = formData.get("title")?.trim() || "Untitled Quiz";
    const count = Math.min(20, Math.max(5, parseInt(formData.get("count") || "10", 10)));
    const typesRaw = formData.get("types") || "multiple_choice";
    const types = typesRaw.split(",").map((t) => t.trim()).filter(Boolean);

    let text = "";
    let sourceFileName;

    if (source === "pdf") {
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return Response.json({ error: "No PDF file provided." }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      sourceFileName = file.name;
      text = await extractTextFromPDF(buffer);
    } else {
      text = formData.get("text")?.trim() || "";
    }

    if (!text) {
      return Response.json({ error: "No study material provided." }, { status: 400 });
    }

    const questions = await generateQuestions(text, { count, types });

    const quiz = {
      id: crypto.randomUUID(),
      title,
      questions,
      createdAt: new Date().toISOString(),
      ...(sourceFileName && { sourceFileName }),
    };

    return Response.json({ quiz });
  } catch (err) {
    console.error("[generate-questions]", err);
    return Response.json(
      { error: err.message || "Failed to generate questions." },
      { status: 500 }
    );
  }
}
