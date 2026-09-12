import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount, // <-- contador de notificaciones no leídas
} from "../controllers/notificationController.js";

const router = Router();

// 🔹 Obtener todas las notificaciones del usuario logueado
router.get("/", protect, getNotifications);

// 🔹 Obtener la cantidad de notificaciones no leídas
router.get("/unread", protect, getUnreadCount);

// 🔹 Marcar una notificación como leída
router.put("/:id/read", protect, markAsRead);

// 🔹 Marcar todas como leídas
router.put("/read-all", protect, markAllAsRead);

export default router;