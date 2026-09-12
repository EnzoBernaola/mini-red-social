// components/profile/ProfileHeader.jsx
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";

export default function ProfileHeader({
  user,
  isOwnProfile,
  onEdit,
  onFollow,
  isFollowing
}) {
  return (
    <div className="profile-card">

      <img
        src={
          getImageUrl(user.avatar)
        }
        alt="avatar"
        className="profile-avatar"
      />

      <h1 className="profile-username">
        {isOwnProfile ? "Mi perfil" : user.username}
      </h1>

      {isOwnProfile && (
        <p className="profile-email">{user.email}</p>
      )}

      {isOwnProfile ? (
        <div className="profile-actions">
          <button onClick={onEdit}>Editar</button>

          <Link to="/settings/password">
            <button>Cambiar contraseña</button>
          </Link>
        </div>
      ) : (
        <div className="profile-actions">
          <button onClick={onFollow}>
            {isFollowing ? "Siguiendo" : "Seguir"}
          </button>

          <Link to={`/chat/${user.username}`}>
            <button>Mensaje</button>
          </Link>
        </div>
      )}

    </div>
  );
}