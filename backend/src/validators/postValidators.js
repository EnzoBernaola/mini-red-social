import { body } from "express-validator";

export const createPostValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("El post debe tener entre 1 y 500 caracteres"),
];

export const commentValidation = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("El comentario debe tener entre 1 y 300 caracteres"),
];
