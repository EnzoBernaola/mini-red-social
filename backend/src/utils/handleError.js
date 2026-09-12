// Interpreta el tipo de error real y responde con el status
// y mensaje que corresponde, en vez de un 500 genérico para todo.
export const handleError = (error, res, fallbackMsg = "Error interno del servidor") => {
  console.error(error);

  // Dato duplicado (ej: email o username que ya existe)
  if (error.code === 11000) {
    const campo = Object.keys(error.keyPattern || {})[0] || "dato";
    return res.status(400).json({ msg: `Ese ${campo} ya está en uso` });
  }

  // El modelo de Mongoose rechazó los datos (ej: campo requerido faltante)
  if (error.name === "ValidationError") {
    const mensajes = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ msg: mensajes.join(", ") });
  }

  // El id recibido no tiene formato válido de MongoDB
  if (error.name === "CastError") {
    return res.status(400).json({ msg: "ID inválido" });
  }

  // Cualquier otro caso: ahí sí es un error real de servidor
  return res.status(500).json({ msg: fallbackMsg });
};
