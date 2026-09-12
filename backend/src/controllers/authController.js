// src/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { handleError } from "../utils/handleError.js";

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
