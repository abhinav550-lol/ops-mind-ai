import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";

// ─── Individual Parsers ─────────────────────────────────────────────

/**
 * Parse a PDF file into plain text.
 */
export async function parsePDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text.trim();
}

/**
 * Parse a DOCX file into plain text.
 */
export async function parseDOCX(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

/**
 * Parse a TXT file into plain text.
 */
export async function parseTXT(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  return text.trim();
}

/**
 * Parse a CSV file into plain text (row-per-line).
 */
export async function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  return text.trim();
}

/**
 * Parse an XLSX file into plain text.
 * Each sheet is converted to CSV, separated by a header.
 */
export async function parseXLSX(filePath) {
  const workbook = XLSX.readFile(filePath);
  const parts = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    parts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
  }

  return parts.join("\n\n").trim();
}

/**
 * Parse an image (PNG / JPG) into plain text using Tesseract OCR.
 */
export async function parseImage(filePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(filePath, "eng");
  return text.trim();
}

// ─── MIME-type → Parser mapping ─────────────────────────────────────

const PARSER_MAP = {
  "application/pdf": parsePDF,
  "application/msword": parseDOCX,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    parseDOCX,
  "text/plain": parseTXT,
  "text/csv": parseCSV,
  "application/vnd.ms-excel": parseXLSX,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    parseXLSX,
  "image/png": parseImage,
  "image/jpeg": parseImage,
};

// Extension fallback (when MIME type is unavailable)
const EXT_MAP = {
  ".pdf": parsePDF,
  ".doc": parseDOCX,
  ".docx": parseDOCX,
  ".txt": parseTXT,
  ".csv": parseCSV,
  ".xls": parseXLSX,
  ".xlsx": parseXLSX,
  ".png": parseImage,
  ".jpg": parseImage,
  ".jpeg": parseImage,
};

// ─── Dispatcher ─────────────────────────────────────────────────────

/**
 * Accepts a file path and an optional MIME type.
 * Detects the file type and routes it to the correct parser.
 *
 * @param {string} filePath  — absolute or relative path to the file
 * @param {string} [mimeType] — MIME type (preferred); falls back to extension
 * @returns {Promise<string>} — extracted plain text
 */
export async function parseFile(filePath, mimeType) {
  // Try MIME-based lookup first
  let parser = mimeType ? PARSER_MAP[mimeType] : null;

  // Fall back to extension-based lookup
  if (!parser) {
    const ext = path.extname(filePath).toLowerCase();
    parser = EXT_MAP[ext];
  }

  if (!parser) {
    throw new Error(
      `Unsupported file type: ${mimeType || path.extname(filePath)}. ` +
        `Supported types: PDF, DOCX, TXT, CSV, XLSX, PNG, JPG.`
    );
  }

  return parser(filePath);
}
