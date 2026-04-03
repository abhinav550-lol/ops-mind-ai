// ─── Chat Service ────────────────────────────────────────────────────
// Wraps the RAG pipeline with conversation history support.

import Groq from "groq-sdk";
import { embedText } from "../ai/embeddingService.js";
import { retrieveChunks } from "../ai/ragService.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";
const HISTORY_LIMIT = 5; // number of past messages to include as context

// ─── System prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on provided SOP (Standard Operating Procedure) documents.

Rules:
- Answer ONLY using the provided context documents.
- You may use the conversation history to understand follow-up questions or clarifications.
- Do NOT use any outside knowledge or make up information.
- If the context is insufficient, say: "I don't have enough information in the uploaded SOPs to answer this."
- Keep answers concise, clear, and well-structured.
- Reference source file names when citing information.`;

// ─── Main function ───────────────────────────────────────────────────

/**
 * Ask a question with full RAG + conversation history context.
 *
 * @param {string} question
 * @param {string} companyId — company whose SOPs to search
 * @param {string[]} [fileIds]  — restrict retrieval to these files
 * @param {{ role: string, content: string }[]} [history] — recent messages
 * @returns {Promise<{ answer: string, sources: object[] }>}
 */
export async function askQuestionWithContext(question, companyId, fileIds = [], history = []) {
  // 1. Embed the question
  const queryEmbedding = await embedText(question);

  // 2. Retrieve relevant chunks (scoped to company)
  const chunks = await retrieveChunks(
    queryEmbedding,
    companyId,
    fileIds.length > 0 ? fileIds : undefined
  );

  // 3. Build context text from chunks
  const contextText =
    chunks.length > 0
      ? chunks
          .map((chunk, i) => {
            const src = chunk.metadata?.fileName || "Unknown file";
            return `[Source ${i + 1}: ${src}]\n${chunk.text}`;
          })
          .join("\n\n---\n\n")
      : null;

  // 4. Truncate history to last N messages
  const recentHistory = history.slice(-HISTORY_LIMIT).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 5. Build messages array for Groq
  const userContent = contextText
    ? `Context Documents:\n\n${contextText}\n\n---\n\nQuestion: ${question}`
    : `Question: ${question}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: "user", content: userContent },
  ];

  // 6. Generate answer
  const completion = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 1024,
  });

  const answer =
    completion.choices[0]?.message?.content ||
    "I don't have enough information in the uploaded SOPs to answer this.";

  // 7. Format sources
  const sources = chunks.map((chunk) => ({
    fileId: chunk.fileId,
    fileName: chunk.metadata?.fileName || "Unknown",
    chunkIndex: chunk.chunkIndex,
    preview: chunk.metadata?.preview || chunk.text?.substring(0, 200),
    score: chunk.score,
  }));

  return { answer, sources };
}
