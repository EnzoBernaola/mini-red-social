import { body } from "express-validator";

export const updateCredentialsValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El usuario debe tener entre 3 y 20 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("El usuario solo puede tener letras, números y guion bajo"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Ingresá tu contraseña actual"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
];

export const updateMeValidation = [
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("La bio no puede superar los 160 caracteres"),

  body("technologies")
    .optional()
    .isArray()
    .withMessage("Las tecnologías deben ser una lista"),
];
