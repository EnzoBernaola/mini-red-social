import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";

export default function FollowersModal({ title, users, onClose }) {

  // cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-list">
          {users?.length ? (
            users.map((u) => {
              if (!u?._id || !u?.username) return null;

              const avatarSrc = getImageUrl(u.avatar);

              return (
                <Link
                  key={u._id}
                  to={`/profile/${u.username}`}
                  className="modal-user"
                  onClick={onClose} // 🔥 cerrar al navegar
                >
                  <img
                    src={avatarSrc}
                    alt={u.username}
                    className="modal-avatar"
                  />

                  <span className="modal-username">
                    {u.username}
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="empty">No hay usuarios</p>
          )}
        </div>

      </div>
    </div>
  );
}