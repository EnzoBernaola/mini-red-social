import Notification from "../models/Notification.js";
import { handleError } from "../utils/handleError.js";

// Obtener todas las notificaciones del usuario
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("fromUser", "username avatar")
      .populate("post", "content");

const formattedNotifications = notifications.map((n) => {

  let message = "";

  switch (n.type) {

    case "like_post":
      message = "le dio like a tu post";
      break;

    case "comment_post":
      message = "comentó tu post";
      break;

    case "like_comment":
      message = "le dio like a tu comentario";
      break;

    case "follow":
      message = "empezó a seguirte";
      break;

    case "new_post":
      message = "publicó un nuevo post";
      break;

    default:
      message = "tiene una nueva interacción";
  }

  return {
    ...n.toObject(),
    message
  };

});

    res.json(formattedNotifications);
  } catch (error) {
    handleError(error, res, "Error obteniendo notificaciones");
  }
};

// Obtener la cantidad de notificaciones no leídas
export const getUnreadCount = async (req, res) => {
  try {
const count = await Notification.countDocuments({
  user: req.user.id,
  isRead: false,
});
    res.json({ count });
  } catch (error) {
    handleError(error, res, "Error obteniendo notificaciones no leídas");
  }
};

// Marcar una notificación como leída
export const markAsRead = async (req, res) => {
  try {
  const notification = await Notification.findByIdAndUpdate(
  req.params.id,
  { isRead: true },
  { new: true }
);
    res.json(notification);
  } catch (error) {
    handleError(error, res, "Error marcando notificación como leída");
  }
};

// Marcar todas como leídas
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
  { user: req.user.id, isRead: false },
  { isRead: true }
);
    res.json({ msg: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    handleError(error, res, "Error marcando todas las notificaciones como leídas");
  }
};