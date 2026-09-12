import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { API_URL } from "../api/config";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Error al registrar");
        return;
      }

      alert("Usuario creado correctamente ✅");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <h1>Crear cuenta</h1>

        <p className="register-subtitle">
          Registrate para comenzar a compartir contenido.
        </p>

        <form onSubmit={handleSubmit} className="register-form">

          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

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
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>

        </form>

        <p className="register-login">
          ¿Ya tenés cuenta?

          <span onClick={() => navigate("/")}>
            Iniciar sesión
          </span>
        </p>

      </div>
    </div>
  );
}