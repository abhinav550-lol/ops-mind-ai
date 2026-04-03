import AppError from "../error/appError.js";
import { askQuestion } from "../ai/ragService.js";

/**
 * Ask a question across a company's SOP documents.
 * POST /api/rag/ask
 * Body: { question, companyId, fileIds? }
 */
export const askQuestionHandler = async (req, res, next) => {
  try {
    const { question, companyId, fileIds } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return next(new AppError("Please provide a question.", 400));
    }

    if (!companyId) {
      return next(new AppError("Please provide a companyId to query SOPs.", 400));
    }

    const result = await askQuestion(question.trim(), companyId, fileIds);

    res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ask a question scoped to a single SOP file.
 * POST /api/rag/ask-file/:fileId
 * Body: { question, companyId }
 */
export const askQuestionByFile = async (req, res, next) => {
  try {
    const { question, companyId } = req.body;
    const { fileId } = req.params;

    if (!question || typeof question !== "string" || !question.trim()) {
      return next(new AppError("Please provide a question.", 400));
    }

    if (!fileId) {
      return next(new AppError("File ID is required.", 400));
    }

    if (!companyId) {
      return next(new AppError("Please provide a companyId.", 400));
    }

    const result = await askQuestion(question.trim(), companyId, [fileId]);

    res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    next(error);
  }
};
