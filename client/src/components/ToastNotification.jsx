import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { getImageUrl } from "../utils/getImageUrl";
import "../styles/ToastNotification.css";
import { API_URL } from "../api/config";
export default function ToastNotification({ notification, onClose }) {
  const navigate = useNavigate();
  const { fetchUnread } = useNotifications();


  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // =========================
  // CLICK NOTIFICACIÓN
  // =========================
  const handleClick = async () => {

  // =========================
  // MENSAJE (NO ES NOTIFICACIÓN DB)
  // =========================
  if (notification.type === "message") {
    navigate(`/chat/${notification.fromUser._id}`);
    onClose();
    return;
  }

  // =========================
  // RESTO DE NOTIFICACIONES
  // =========================
  try {

    const token = localStorage.getItem("token");

    await fetch(
      `${API_URL}/api/notifications/${notification._id}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchUnread();

  } catch (error) {

    console.error("Error marcando notificación como leída:", error);

  }

  // =========================
  // NAVEGACIÓN
  // =========================
  if (notification.type === "follow") {

    navigate(`/profile/${notification.fromUser.username}`);

  } else if (notification.post) {

    const postId =
      typeof notification.post === "string"
        ? notification.post
        : notification.post._id;

    navigate(`/post/${postId}`);

  }

  onClose();
};

  // =========================
  // MENSAJE
  // =========================
const getMessage = () => {
  switch (notification.type) {
    case "like_post":
      return "❤️ le dio like a tu publicación";

    case "like_comment":
      return "❤️ le dio like a tu comentario";

    case "comment_post":
      return "💬 comentó tu publicación";

    case "follow":
      return "👤 empezó a seguirte";

    case "new_post":
      return "📝 publicó algo nuevo";

    case "message":
      return "💬 te envió un mensaje";

    default:
      return "🔔 interactuó contigo";
  }
};

  // =========================
  // AVATAR (CLAVE DEL FIX)
  // =========================
  const avatarUrl = getImageUrl(notification.fromUser?.avatar);

  return (
    <div className="toast-container" onClick={handleClick}>
      <img
        className="toast-avatar"
        src={avatarUrl}
        alt="avatar"
      />

      <div className="toast-content">
        <span className="toast-user">
          {notification.fromUser?.username}
        </span>

        <span className="toast-message">
          {getMessage()}
        </span>
      </div>

      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ✖
      </button>
    </div>
  );
}