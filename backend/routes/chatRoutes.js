import express from "express";
import isLoggedIn from "../utils/isLoggedIn.js";
import {
  createChat,
  getMyChats,
  getChatMessages,
  sendMessage,
  renameChat,
  deleteChat,
} from "../controller/chatController.js";

const router = express.Router();

// All routes require authentication
router.use(isLoggedIn);

// Create a new chat session
router.post("/", createChat);

// Get all chats for the logged-in user
router.get("/", getMyChats);

// Get messages for a specific chat
router.get("/:chatId/messages", getChatMessages);

// Send a message (RAG-powered)
router.post("/:chatId/message", sendMessage);

// Delete a chat and its messages
router.delete("/:chatId", deleteChat);

export default router;
