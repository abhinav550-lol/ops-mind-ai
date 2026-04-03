// ─── Embedding Service ──────────────────────────────────────────────
// Generates 384-dim embeddings via HuggingFace Inference API
// using sentence-transformers/all-MiniLM-L6-v2.

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;
const MAX_RETRIES = 3;
const BATCH_SIZE = 16;

/**
 * Embed a single text string.
 * @param {string} text
 * @returns {Promise<number[]>} 384-dim vector
 */
export async function embedText(text) {
  const vectors = await callHuggingFace([text]);
  return vectors[0];
}

/**
 * Embed an array of chunk objects. Adds `embedding` field to each chunk.
 * Processes in batches to respect rate limits.
 *
 * @param {{ chunkIndex: number, text: string }[]} chunks
 * @returns {Promise<{ chunkIndex: number, text: string, embedding: number[] }[]>}
 */
export async function embedChunks(chunks) {
  const results = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.text).filter(Boolean);

    if (texts.length === 0) continue;

    try {
      const vectors = await callHuggingFace(texts);

      for (let j = 0; j < batch.length; j++) {
        if (!batch[j].text) {
          console.warn(`Skipping empty chunk at index ${batch[j].chunkIndex}`);
          continue;
        }
        results.push({
          ...batch[j],
          embedding: vectors[j],
        });
      }
    } catch (err) {
      console.error(
        `Embedding batch ${i / BATCH_SIZE + 1} failed: ${err.message}`
      );
      // Mark failed chunks with null embedding so caller can handle
      for (const chunk of batch) {
        results.push({ ...chunk, embedding: null });
      }
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < chunks.length) {
      await sleep(200);
    }
  }

  return results;
}

/**
 * Call HuggingFace Inference API with retry.
 * @param {string[]} inputs
 * @returns {Promise<number[][]>}
 */
async function callHuggingFace(inputs, attempt = 1) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set in environment variables");
  }

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
  });

  if (!response.ok) {
    const body = await response.text();

    // Model loading — retry after delay
    if (response.status === 503 && attempt <= MAX_RETRIES) {
      const wait = attempt * 5000;
      console.log(
        `HuggingFace model loading, retrying in ${wait / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`
      );
      await sleep(wait);
      return callHuggingFace(inputs, attempt + 1);
    }

    // Rate limit — retry after delay
    if (response.status === 429 && attempt <= MAX_RETRIES) {
      const wait = attempt * 3000;
      console.log(
        `HuggingFace rate limited, retrying in ${wait / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`
      );
      await sleep(wait);
      return callHuggingFace(inputs, attempt + 1);
    }

    throw new Error(`HuggingFace API error (${response.status}): ${body}`);
  }

  return response.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
