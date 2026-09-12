import express from "express";
import {
  getMe,
  updateMe,
  followUser,
  searchUsers,
  updateCredentials,
  getUserProfile,
  updateAvatar,
  changePassword,
  getUserById
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import User from "../models/User.js";
import validate from "../middleware/validate.js";
import { updateCredentialsValidation, changePasswordValidation, updateMeValidation } from "../validators/userValidators.js";

const router = express.Router();

// subir / cambiar avatar
router.put(
  "/avatar",
  protect,
  upload.single("avatar"),
  updateAvatar
);

// actualizar credenciales
router.put("/me/credentials", protect, updateCredentialsValidation, validate, updateCredentials);

// obtener perfil propio
router.get("/me", protect, getMe);

// actualizar perfil
router.put("/me", protect, updateMeValidation, validate, updateMe);

// cambiar contraseña
router.put("/me/password", protect, changePasswordValidation, validate, changePassword);

// buscar usuarios
router.get("/search", protect, searchUsers);

// seguir / dejar de seguir
router.put("/follow/:id", protect, followUser);

/* ================= BUSCAR USUARIO POR ID ================= */
/* IMPORTANTE: esta ruta debe ir antes que /:username */
router.get("/id/:id", protect, getUserById);

/* ================= PERFIL POR USERNAME ================= */
router.get("/:username", protect, getUserProfile);

export default router;