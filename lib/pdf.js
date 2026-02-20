// Use internal path to avoid pdf-parse v1's startup file-read that breaks Next.js
import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Extracts plain text from a PDF buffer.
 * @param {Buffer} buffer - Raw PDF file bytes
 * @returns {Promise<string>} Extracted text content
 */
export async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text.trim();
}
