// Única fuente de verdad para la URL del backend.
// En desarrollo local, usa http://localhost:5000 por defecto.
// En producción, Vite reemplaza esto con el valor de VITE_API_URL
// que se configure en el panel de Vercel (o donde se deployee).
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
