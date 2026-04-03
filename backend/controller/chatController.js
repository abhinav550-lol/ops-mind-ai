import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import AppError from "../error/appError.js";
import { askQuestionWithContext } from "../services/chatService.js";

// ─── CREATE ──────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * Create a new chat session scoped to a company's SOPs.
 * Body: { companyId, title?, fileIds? }
 */
export const createChat = async (req, res, next) => {
  try {
    const { companyId, title, fileIds } = req.body;

    if (!companyId) {
      return next(new AppError("Please provide a companyId to start a chat.", 400));
    }

    const chat = await Chat.create({
      userId: req.session.user._id,
      companyId: companyId,
      title: title?.trim() || "New Chat",
      fileIds: Array.isArray(fileIds) ? fileIds : [],
    });

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// ─── READ ────────────────────────────────────────────────────────────

/**
 * GET /api/chat
 * Get all chats belonging to the logged-in user.
 */
export const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.session.user._id })
      .populate("companyId", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: chats.length, data: chats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/:chatId/messages
 * Get all messages for a chat.
 */
export const getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) return next(new AppError("Chat not found.", 404));
    if (chat.userId.toString() !== req.session.user._id.toString()) {
      return next(new AppError("You are not authorized to view this chat.", 403));
    }

    const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

// ─── SEND MESSAGE ─────────────────────────────────────────────────────

/**
 * POST /api/chat/:chatId/message
 * Send a question and receive a RAG-grounded answer from company SOPs.
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { question } = req.body;
    const userId = req.session.user._id;

    if (!question || !question.trim()) {
      return next(new AppError("Please provide a question.", 400));
    }

    // 1. Validate chat ownership
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return next(new AppError("Chat not found.", 404));
    if (chat.userId.toString() !== userId.toString()) {
      return next(new AppError("You are not authorized to send messages in this chat.", 403));
    }

    // 2. Save user message
    const userMessage = await Message.create({
      chatId: chat._id,
      role: "user",
      content: question.trim(),
    });

    // 3. Fetch recent history for context (exclude the just-saved user message)
    const recentMessages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Reverse to chronological order, exclude the last user message
    const history = recentMessages
      .reverse()
      .filter((m) => m._id.toString() !== userMessage._id.toString());

    // 4. Call RAG with context — scoped to the chat's company
    const { answer, sources } = await askQuestionWithContext(
      question.trim(),
      chat.companyId.toString(),
      chat.fileIds.map((id) => id.toString()),
      history
    );

    // 5. Auto-title chat from first question if still "New Chat"
    if (chat.title === "New Chat") {
      chat.title = question.trim().substring(0, 60);
      await chat.save();
    }

    // 6. Save assistant message
    const assistantMessage = await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: answer,
      sources,
    });

    // 7. Respond
    res.status(200).json({
      success: true,
      answer,
      sources,
      messageId: assistantMessage._id,
      chatId: chat._id,
      chatTitle: chat.title,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE / DELETE ─────────────────────────────────────────────────

/**
 * PATCH /api/chat/:chatId
 * Rename a chat.
 */
export const renameChat = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return next(new AppError("Please provide a new title.", 400));
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return next(new AppError("Chat not found.", 404));
    if (chat.userId.toString() !== req.session.user._id.toString()) {
      return next(new AppError("You are not authorized to modify this chat.", 403));
    }

    chat.title = title.trim();
    await chat.save();

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/chat/:chatId
 * Delete a chat and all its messages.
 */
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return next(new AppError("Chat not found.", 404));
    if (chat.userId.toString() !== req.session.user._id.toString()) {
      return next(new AppError("You are not authorized to delete this chat.", 403));
    }

    await Promise.all([
      Chat.findByIdAndDelete(chat._id),
      Message.deleteMany({ chatId: chat._id }),
    ]);

    res.status(200).json({ success: true, message: "Chat deleted." });
  } catch (error) {
    next(error);
  }
};
