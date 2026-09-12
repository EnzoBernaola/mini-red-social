// src/routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { registerValidation, loginValidation } from "../validators/authValidators.js";


const router = express.Router();

// 📝 Registro
router.post("/register", registerValidation, validate, registerUser);

// 🔑 Login
router.post("/login", loginValidation, validate, loginUser);

// 👤 Obtener usuario actual (protegido)
router.get("/me", protect, getCurrentUser);

export default router;
