import express from "express";
import {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadMessagesCount,
  markConversationRead
} from "../controllers/messageController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getConversations);

router.get("/unread", authMiddleware, getUnreadMessagesCount);

router.get("/:userId", authMiddleware, getConversation);

router.post("/:userId", authMiddleware, sendMessage);

router.put("/read/:userId", authMiddleware, markConversationRead);

export default router;