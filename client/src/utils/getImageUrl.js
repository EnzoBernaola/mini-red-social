import { API_URL } from "../api/config";

// Arma la URL correcta para mostrar una imagen (avatar o post),
// sea vieja (guardada localmente) o nueva (subida a Cloudinary).
export function getImageUrl(src) {
  if (!src || src.includes("default-avatar")) return "/default-avatar.png";

  // Si ya es una URL completa (Cloudinary), se usa tal cual.
  if (src.startsWith("http")) return src;

  // Compatibilidad con imágenes viejas subidas antes de migrar a Cloudinary.
  return `${API_URL}/uploads/${src}`;
}
