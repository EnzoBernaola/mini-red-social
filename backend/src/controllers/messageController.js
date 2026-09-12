import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { handleError } from "../utils/handleError.js";

/**
 * Enviar mensaje
 * POST /api/messages/:userId
 */
export const sendMessage = async (req, res) => {
  try {

    const senderId = req.user.id;
    const receiverId = req.params.userId;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ msg: "Mensaje vacío" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text
    });

    await message.populate("sender", "username avatar");
    await message.populate("receiver", "username avatar");

    const io = req.app.get("io");

    // evento principal
    io.to(receiverId.toString()).emit("newMessage", message);
    io.to(senderId.toString()).emit("newMessage", message);

    res.status(201).json(message);

  } catch (error) {

    handleError(error, res, "Error enviando mensaje");

  }
};

export const getUnreadMessagesCount = async (req, res) => {

  try {

    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.json({ count });

  } catch (error) {

    handleError(error, res, "Error obteniendo mensajes no leídos");

  }

};

export const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username")
      .populate("receiver", "username");

    res.json(messages);
  } catch (error) {
    handleError(error, res, "Error obteniendo conversación");
  }
};
export const markConversationRead = async (req, res) => {

  try {

    const currentUser = req.user.id;
    const otherUser = req.params.userId;

    await Message.updateMany(
      {
        sender: otherUser,
        receiver: currentUser,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ msg: "Mensajes marcados como leídos" });

  } catch (error) {

    handleError(error, res, "Error marcando mensajes como leídos");

  }

};

export const getConversations = async (req, res) => {

  try {

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([

      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },

      { $sort: { createdAt: -1 } },

      {
        $group: {

          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },

          lastMessage: { $first: "$text" },
          updatedAt: { $first: "$createdAt" },

          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          }

        }
      }

    ]);

    const populated = await User.populate(conversations, {
      path: "_id",
      select: "username avatar"
    });

    res.json(populated);

  } catch (error) {

    handleError(error, res, "Error obteniendo conversaciones");

  }

};