// src/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { handleError } from "../utils/handleError.js";
import { sendEmail } from "../utils/sendEmail.js";

// Registro
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Usuario ya existe" });

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    handleError(error, res, "Error al registrar usuario");
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Todos los campos son obligatorios" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    handleError(error, res, "Error al hacer login");
  }
};

// Obtener usuario actual
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    handleError(error, res, "Error al obtener usuario");
  }
};

// Olvidé mi contraseña: genera un token y manda el mail
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El email es obligatorio" });

    const user = await User.findOne({ email });

    // Por seguridad, respondemos lo mismo exista o no el usuario,
    // así no se puede usar este endpoint para saber qué emails están registrados.
    if (!user) {
      return res.json({
        msg: "Si el email está registrado, vas a recibir un correo con las instrucciones",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutos
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Recuperar contraseña",
      html: `
        <p>Hola ${user.username},</p>
        <p>Pediste restablecer tu contraseña. Hacé click en el siguiente enlace (válido por 30 minutos):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si no fuiste vos, ignorá este mensaje.</p>
      `,
    });

    res.json({
      msg: "Si el email está registrado, vas a recibir un correo con las instrucciones",
    });
  } catch (error) {
    handleError(error, res, "Error al procesar la solicitud");
  }
};

// Restablecer contraseña con el token recibido por mail
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ msg: "El enlace no es válido o ya expiró" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    handleError(error, res, "Error al restablecer la contraseña");
  }
};
