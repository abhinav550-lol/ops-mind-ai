// ─── Chunking Service ───────────────────────────────────────────────
// Splits cleaned text into overlapping chunks for embedding.

const DEFAULT_CHUNK_SIZE = 600;  // words
const DEFAULT_OVERLAP = 150;     // words

/**
 * Split text into overlapping chunks.
 *
 * @param {string} text — cleaned text to chunk
 * @param {object} [options]
 * @param {number} [options.chunkSize=600]  — max words per chunk
 * @param {number} [options.overlap=150]    — word overlap between chunks
 * @returns {{ chunkIndex: number, text: string }[]}
 */
export function chunkText(text, options = {}) {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap || DEFAULT_OVERLAP;

  if (!text || typeof text !== "string") return [];

  const words = text.split(/\s+/).filter(Boolean);

  if (words.length === 0) return [];

  // If text fits in one chunk, return as-is
  if (words.length <= chunkSize) {
    return [{ chunkIndex: 0, text: words.join(" ") }];
  }

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunkWords = words.slice(start, end);

    chunks.push({
      chunkIndex: index,
      text: chunkWords.join(" "),
    });

    // Advance by (chunkSize - overlap), but at least 1 word
    const step = Math.max(chunkSize - overlap, 1);
    start += step;
    index++;

    // If remaining words < overlap, absorb them into the last chunk
    if (start < words.length && words.length - start < overlap) {
      const remaining = words.slice(start);
      // Append to the last chunk to avoid a tiny trailing chunk
      chunks[chunks.length - 1].text += " " + remaining.join(" ");
      break;
    }
  }

  return chunks;
}
