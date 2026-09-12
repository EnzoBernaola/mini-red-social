import { validationResult } from "express-validator";

// Middleware genérico: revisa si alguna validación anterior falló
// y, si es así, corta la petición devolviendo los errores.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      msg: "Datos inválidos",
      errores: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }

  next();
};

export default validate;
