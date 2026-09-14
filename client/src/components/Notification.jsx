import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

import "../styles/Notification.css";
import { getImageUrl } from "../utils/getImageUrl";
import { API_URL } from "../api/config";

export default function Notification() {

  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const { setCount } = useNotifications();

  // =========================
  // MARCAR COMO LEÍDA
  // =========================
  const markAsRead = async (id) => {

    try {

      await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? { ...n, isRead: true }
            : n
        )
      );

    } catch (error) {

      console.error(error);

    }
  };

  // =========================
  // CLICK NOTIFICACIÓN
  // =========================
  const handleClick = async (n) => {

    await markAsRead(n._id);

    const esDeUnPost = ["like_post", "comment_post", "like_comment", "new_post"].includes(n.type);

    if (n.post) {

      const postId = n.post?._id || n.post;

      if (postId) {
        navigate(`/post/${postId}`);
        return;
      }
    }

    // Si el tipo de notificación depende de un post pero ya no lo trae
    // (porque el post se borró), no tiene sentido mandar al perfil como
    // si la notificación fuera de otra cosa.
    if (esDeUnPost) {
      alert("El posteo relacionado a esta notificación ya no existe.");
      return;
    }

    if (n.fromUser?.username) {
      navigate(`/profile/${n.fromUser.username}`);
    }
  };

  // =========================
  // CARGAR NOTIFICACIONES
  // =========================
  useEffect(() => {

    const loadNotifications = async () => {

      try {

        const res = await fetch(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

const data = await res.json();

const filtered = data.filter(
  n =>
    n.fromUser &&
    n.fromUser.username
);

setNotifications(filtered);

setCount(filtered.filter(n => !n.isRead).length);

      } catch (error) {

        console.error(error);

      }
    };

    loadNotifications();

  }, []);

  return (
    <div className="notifications-page">

      <div className="notifications-header">

        <Link
          to="/feed"
          className="back-button"
        >
          ← Volver al feed
        </Link>

        <h1 className="notifications-title">
          Notificaciones
        </h1>

      </div>

      {notifications.length === 0 ? (

        <p className="notifications-empty">
          No tenés notificaciones.
        </p>

      ) : (

        <div className="notifications-list">

          {notifications.map((n) => {

            const avatarSrc = getImageUrl(n.fromUser?.avatar);

            return (

              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`notification-card ${
                  !n.isRead ? "unread" : ""
                }`}
              >

                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="notification-avatar"
                />

                <div className="notification-body">

                  <div className="notification-top">

                    <span className="notification-username">
                      {n.fromUser?.username || "Usuario"}
                    </span>

                    {!n.isRead && (
                      <span className="notification-dot" />
                    )}

                  </div>

                  <p className="notification-text">

                    {n.message}

                    {n.post && typeof n.post !== "string" && (
                      <span className="notification-post">
                        {" "}
                        — "
                        {n.post.content?.slice(0, 50)}
                        ..."
                      </span>
                    )}

                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}