import { extractTextFromPDF } from "@/lib/pdf";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    if (!text) {
      return Response.json({ error: "Could not extract text from PDF." }, { status: 400 });
    }

    return Response.json({ text, sourceFileName: file.name });
  } catch (err) {
    console.error("[extract-text]", err);
    return Response.json(
      { error: err.message || "Failed to extract text." },
      { status: 500 }
    );
  }
}
