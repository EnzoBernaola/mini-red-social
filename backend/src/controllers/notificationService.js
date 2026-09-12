import Notification from "../models/Notification.js";

export const createNotification = async (req, data) => {

  // crear
  const notification = await Notification.create(data);

  // populate REAL
  const fullNotification = await Notification.findById(notification._id)
    .populate("fromUser", "username avatar")
    .populate("post", "content");

  const io = req.app.get("io");

  // emitir populateado
  io.to(data.user.toString()).emit(
    "notification",
    fullNotification
  );

  return fullNotification;
};