import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { API_URL } from "../api/config";

export default function Login({ login }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Error al iniciar sesión");
        return;
      }

      if (login) {
  login(data.token);
} else {
  localStorage.setItem("token", data.token);
}

navigate("/feed");

      // Directamente al Feed
      navigate("/feed");
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Bienvenido</h1>

        <p className="login-subtitle">
          Iniciá sesión para continuar.
        </p>

        <form onSubmit={handleSubmit} className="login-form">

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

        </form>

        <p className="login-register">
          ¿No tenés cuenta?

          <span onClick={() => navigate("/register")}>
            Registrate
          </span>
        </p>

      </div>
    </div>
  );
}