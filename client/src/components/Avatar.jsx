import { getImageUrl } from "../utils/getImageUrl";

export default function Avatar({ src, size="normal" }) {

  const avatarUrl = getImageUrl(src);

  return (
    <img
      src={avatarUrl}
      alt="avatar"
      className={size === "small" ? "avatar-small" : "avatar"}
    />
  );
}
