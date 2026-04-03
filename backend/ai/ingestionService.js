// ─── Ingestion Service ──────────────────────────────────────────────
// Orchestrates: parse → clean → chunk → embed → save for a single file.

import File from "../models/fileModel.js";
import DocumentChunk from "../models/chunkModel.js";
import { parseFile } from "./parserService.js";
import { cleanExtractedText } from "./textCleaningService.js";
import { chunkText } from "./chunkingService.js";
import { embedChunks } from "./embeddingService.js";

/**
 * Run the full ingestion pipeline for a file.
 * Updates file.status at each stage. On error, marks file as "failed".
 *
 * @param {string} fileId — MongoDB ObjectId of the File document
 */
export async function ingestFile(fileId) {
  let file;

  try {
    file = await File.findById(fileId);
    if (!file) throw new Error(`File not found: ${fileId}`);

    // ── Step 1: Extract text ────────────────────────────────────
    await updateFileStatus(file, "extracting_text");

    const rawText = await parseFile(file.filePath, file.mimeType);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("No text could be extracted from the file");
    }

    // ── Step 2: Clean text ──────────────────────────────────────
    const cleanedText = cleanExtractedText(rawText);
    file.extractedText = cleanedText;
    await file.save();

    console.log(
      `[Ingestion] ${file.originalName}: extracted ${cleanedText.length} chars`
    );

    // ── Step 3: Chunk text ──────────────────────────────────────
    await updateFileStatus(file, "chunking");

    const chunks = chunkText(cleanedText);

    if (chunks.length === 0) {
      throw new Error("Text chunking produced zero chunks");
    }

    file.chunkCount = chunks.length;
    await file.save();

    console.log(
      `[Ingestion] ${file.originalName}: created ${chunks.length} chunks`
    );

    // ── Step 4: Embed chunks ────────────────────────────────────
    await updateFileStatus(file, "embedding");
    file.embeddingStatus = "processing";
    await file.save();

    const embeddedChunks = await embedChunks(chunks);

    // Filter out chunks where embedding failed
    const validChunks = embeddedChunks.filter((c) => c.embedding !== null);
    const failedCount = embeddedChunks.length - validChunks.length;

    if (failedCount > 0) {
      console.warn(
        `[Ingestion] ${file.originalName}: ${failedCount} chunks failed embedding`
      );
    }

    if (validChunks.length === 0) {
      throw new Error("All chunk embeddings failed");
    }

    // ── Step 5: Save chunks to DB ───────────────────────────────
    const chunkDocs = validChunks.map((chunk) => ({
      fileId: file._id,
      companyId: file.companyId,
      uploadedBy: file.uploadedBy,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      embedding: chunk.embedding,
      metadata: {
        fileName: file.originalName,
        category: file.metadata?.category || "",
        preview: chunk.text.substring(0, 200),
      },
    }));

    // Remove any existing chunks for this file (in case of re-ingestion)
    await DocumentChunk.deleteMany({ fileId: file._id });
    await DocumentChunk.insertMany(chunkDocs);

    // ── Step 6: Mark as ready ───────────────────────────────────
    file.status = "ready";
    file.embeddingStatus = "completed";
    file.chunkCount = validChunks.length;
    await file.save();

    console.log(
      `[Ingestion] ${file.originalName}: ✅ ready (${validChunks.length} chunks embedded)`
    );
  } catch (err) {
    console.error(`[Ingestion] Failed for file ${fileId}:`, err.message);

    if (file) {
      file.status = "failed";
      file.embeddingStatus = "failed";
      file.failureReason = err.message;
      await file.save().catch(() => {});
    }
  }
}

async function updateFileStatus(file, status) {
  file.status = status;
  await file.save();
}
