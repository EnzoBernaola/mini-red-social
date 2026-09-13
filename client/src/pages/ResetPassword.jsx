import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import { API_URL } from "../api/config";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || "El enlace no es válido o ya expiró");
        return;
      }

      setSuccess(true);
      setMessage("Contraseña actualizada. Ya podés iniciar sesión.");

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Nueva contraseña</h1>

        {!success && (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <input
              type="password"
              placeholder="Repetir contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Restablecer contraseña"}
            </button>
          </form>
        )}

        {message && <p className="login-subtitle">{message}</p>}

        <p className="login-register">
          <Link to="/">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
