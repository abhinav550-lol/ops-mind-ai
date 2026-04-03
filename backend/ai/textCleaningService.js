// ─── Text Cleaning Service ──────────────────────────────────────────
// Cleans raw extracted text for RAG-friendly processing.

/**
 * Clean raw extracted text for chunking/embedding.
 * @param {string} rawText
 * @returns {string} cleaned text
 */
export function cleanExtractedText(rawText) {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText;

  // Normalize line endings to \n
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Replace tabs with spaces
  text = text.replace(/\t/g, " ");

  // Remove null bytes and control characters (keep newlines)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Collapse multiple spaces into one
  text = text.replace(/ {2,}/g, " ");

  // Collapse 3+ consecutive newlines into 2 (preserve paragraph breaks)
  text = text.replace(/\n{3,}/g, "\n\n");

  // Remove lines that are purely dashes, underscores, equals (decorative separators)
  text = text.replace(/^[-_=]{3,}$/gm, "");

  // Strip repeated page headers/footers (lines appearing 3+ times verbatim)
  text = stripRepeatedLines(text, 3);

  // Trim each line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // Final trim
  return text.trim();
}

/**
 * Remove lines that repeat more than `threshold` times in the document.
 * These are typically page headers, footers, or watermarks.
 */
function stripRepeatedLines(text, threshold) {
  const lines = text.split("\n");
  const counts = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 5) {
      counts[trimmed] = (counts[trimmed] || 0) + 1;
    }
  }

  const repeatedSet = new Set(
    Object.entries(counts)
      .filter(([, count]) => count >= threshold)
      .map(([line]) => line)
  );

  return lines.filter((line) => !repeatedSet.has(line.trim())).join("\n");
}
