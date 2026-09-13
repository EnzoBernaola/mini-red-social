import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import { API_URL } from "../api/config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.msg || "Si el email está registrado, vas a recibir un correo con las instrucciones");
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
        <h1>Recuperar contraseña</h1>

        <p className="login-subtitle">
          Ingresá tu email y te mandamos un enlace para restablecerla.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {message && <p className="login-subtitle">{message}</p>}

        <p className="login-register">
          <Link to="/">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
