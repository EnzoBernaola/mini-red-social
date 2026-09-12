// components/profile/ProfileStats.jsx
export default function ProfileStats({
  followers,
  following,
  onFollowersClick,
  onFollowingClick
}) {
  return (
    <div className="profile-stats">

      <span onClick={onFollowersClick}>
        <strong>{followers?.length || 0}</strong> seguidores
      </span>

      <span onClick={onFollowingClick}>
        <strong>{following?.length || 0}</strong> seguidos
      </span>

    </div>
  );
}