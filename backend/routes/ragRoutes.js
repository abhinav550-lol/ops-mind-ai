import express from "express";
import isLoggedIn from "../utils/isLoggedIn.js";
import {
  askQuestionHandler,
  askQuestionByFile,
} from "../controller/ragController.js";

const router = express.Router();

// POST /api/rag/ask — question across all user's files
router.post("/ask", isLoggedIn, askQuestionHandler); // /api/rag/ask

// POST /api/rag/ask-file/:fileId — question scoped to one file
router.post("/ask-file/:fileId", isLoggedIn, askQuestionByFile); // /api/rag/ask-file/:fileId

export default router;
