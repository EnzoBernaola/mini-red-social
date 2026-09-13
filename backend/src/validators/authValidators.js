import { body } from "express-validator";

export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El usuario debe tener entre 3 y 20 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ0-9_ ]+$/)
    .withMessage("El usuario solo puede tener letras, números, espacios y guion bajo"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Ingresá un email válido")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Ingresá un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];
