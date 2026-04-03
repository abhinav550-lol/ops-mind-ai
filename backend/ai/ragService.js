// ─── RAG Service ────────────────────────────────────────────────────
// Retrieval + Answer generation with Groq + Llama 3.
import dotenv from "dotenv"
dotenv.config()

import Groq from "groq-sdk";
import mongoose from "mongoose";
import DocumentChunk from "../models/chunkModel.js";
import { embedText } from "./embeddingService.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";
const DEFAULT_TOP_K = 5;

// ─── Retrieval ──────────────────────────────────────────────────────

/**
 * Search for the most similar chunks using MongoDB Atlas Vector Search.
 * Scoped to a company's SOP documents.
 *
 * @param {number[]} queryEmbedding — 384-dim vector
 * @param {string} companyId — the company whose SOPs to search
 * @param {string[]} [fileIds] — optional file scope
 * @param {number} [topK=5]
 * @returns {Promise<object[]>} matched chunks with score
 */
export async function retrieveChunks(queryEmbedding, companyId, fileIds, topK = DEFAULT_TOP_K) {
  const filter = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (fileIds && fileIds.length > 0) {
    filter.fileId = {
      $in: fileIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  const pipeline = [
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK,
        filter: filter,
      },
    },
    {
      $addFields: {
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $project: {
        embedding: 0, // exclude the large vector array from results
      },
    },
  ];

  const results = await DocumentChunk.aggregate(pipeline);
  return results;
}

// ─── Answer Generation ──────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are an AI assistant designed to answer questions strictly based on the provided SOP (Standard Operating Procedure) documents.

Guidelines:
- Use ONLY the provided context to generate your answer. Do NOT use any external knowledge or assumptions.
- If the context does not contain sufficient information, respond with:
  "I don't have enough information in the uploaded SOPs to answer this question."
- Always prioritize accuracy over completeness. Do not guess or fabricate information.
- Combine information from multiple context chunks if needed to provide a complete answer.
- Keep answers clear, concise, and well-structured.

Formatting:
- Use bullet points or numbered lists when appropriate.
- Highlight key information clearly.
- When referencing information, include the source file name in parentheses.

Behavior:
- If multiple answers are possible, present them clearly.
- If the question is ambiguous, answer based on the most relevant context.
- Do not mention "context" or "chunks" explicitly in the answer.
`;

/**
 * Generate an answer from context chunks using Groq + Llama 3.
 *
 * @param {string} question
 * @param {object[]} chunks — retrieved chunks with text and metadata
 * @returns {Promise<string>} generated answer
 */
export async function generateAnswer(question, chunks) {
  if (!chunks || chunks.length === 0) {
    return "I don't have enough information in the uploaded SOPs to answer this question.";
  }

  // Build context from chunks
  const contextParts = chunks.map((chunk, i) => {
    const source = chunk.metadata?.fileName || "Unknown file";
    return `[Source ${i + 1}: ${source}]\n${chunk.text}`;
  });

  const contextText = contextParts.join("\n\n---\n\n");

  const userMessage = `Context Documents:\n\n${contextText}\n\n---\n\nQuestion: ${question}`;

  const chatCompletion = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return chatCompletion.choices[0]?.message?.content || "No answer generated.";
}

// ─── End-to-end Ask ─────────────────────────────────────────────────

/**
 * Full RAG flow: embed question → retrieve chunks → generate answer.
 * Scoped to a company's SOP documents.
 *
 * @param {string} question
 * @param {string} companyId — the company whose SOPs to search
 * @param {string[]} [fileIds] — optional file scope
 * @returns {Promise<{ answer: string, sources: object[] }>}
 */
export async function askQuestion(question, companyId, fileIds) {
  // 1. Embed the question
  const queryEmbedding = await embedText(question);

  // 2. Retrieve similar chunks (scoped to company)
  const chunks = await retrieveChunks(queryEmbedding, companyId, fileIds);

  // 3. Generate answer
  const answer = await generateAnswer(question, chunks);

  // 4. Format sources
  const sources = chunks.map((chunk) => ({
    fileId: chunk.fileId,
    fileName: chunk.metadata?.fileName || "Unknown",
    chunkIndex: chunk.chunkIndex,
    preview: chunk.metadata?.preview || chunk.text?.substring(0, 200),
    score: chunk.score,
  }));

  return { answer, sources };
}
