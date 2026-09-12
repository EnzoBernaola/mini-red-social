import User from "../models/User.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";
import { handleError } from "../utils/handleError.js";

// Escapa caracteres especiales de regex para que una búsqueda
// no pueda romper o sobrecargar la consulta a MongoDB.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Obtener perfil de usuario por username
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // El email es un dato privado: solo lo ve el dueño del perfil.
    const isOwnProfile = user._id.toString() === req.user.id;
    const userToSend = user.toObject();

    if (!isOwnProfile) {
      delete userToSend.email;
    }

    res.json(userToSend);

  } catch (error) {
    handleError(error, res, "Error al obtener el perfil");
  }
};
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado"
      });
    }

    res.json(user);

  } catch (error) {
    handleError(error, res, "Error buscando usuario");
  }
};

//Avatar/Foto de Perfil
export const updateAvatar = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!req.file) {
      return res.status(400).json({ msg: "No se subió ninguna imagen" });
    }

    user.avatar = req.file.path;

    await user.save();

    res.json(user);

  } catch (error) {
    handleError(error, res, "Error actualizando avatar");
  }
};

// Obtener perfil propio
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    handleError(error, res, "Error al obtener perfil propio");
  }
};

// Actualizar perfil
export const updateMe = async (req, res) => {
  try {
    const { bio, technologies } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    user.bio = bio ?? user.bio;
    user.technologies = technologies ?? user.technologies;

    await user.save();
    res.json(user);
  } catch (error) {
    handleError(error, res, "Error al actualizar perfil");
  }
};
export const updateCredentials = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ msg: "No hay datos para actualizar" });
    }

    const exists = await User.findOne({ username });

    if (exists && exists._id.toString() !== userId) {
      return res.status(400).json({ msg: "Ese nombre de usuario ya existe" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    handleError(error, res, "Error al actualizar credenciales");
  }
};




// Seguir / dejar de seguir
export const followUser = async (req, res) => {
  try {

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {

      // UNFOLLOW: $pull en los dos documentos, cada uno atómico.
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: userToFollow._id }
      });

      await User.findByIdAndUpdate(userToFollow._id, {
        $pull: { followers: currentUser._id }
      });

    } else {

      // FOLLOW: $addToSet evita además duplicados si llegan dos
      // clicks de "seguir" casi al mismo tiempo.
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { following: userToFollow._id }
      });

      await User.findByIdAndUpdate(userToFollow._id, {
        $addToSet: { followers: currentUser._id }
      });

      if (userToFollow._id.toString() !== currentUser._id.toString()) {

        const notification = await Notification.create({
          user: userToFollow._id,
          fromUser: currentUser._id,
          type: "follow",
          message: "empezó a seguirte"
        });

        // 🔥 IMPORTANTE: usar populate directo sin segunda query manual
        const fullNotification = await Notification.findById(notification._id)
          .populate("fromUser", "username avatar")
          .populate("post", "content");

        const io = req.app.get("io");

        io.to(userToFollow._id.toString()).emit(
          "notification",
          fullNotification
        );
      }
    }

    res.json({
      msg: isFollowing ? "Dejado de seguir" : "Ahora siguiendo"
    });

  } catch (error) {
    handleError(error, res, "Error al seguir/dejar de seguir");
  }
};
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    // ⚠️ NO hashear acá
    user.password = newPassword;

    await user.save();

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    handleError(error, res, "Error al cambiar contraseña");
  }
};



// Buscar usuarios por username
export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.json([]);
    }

const users = await User.find({
  username: { $regex: escapeRegex(username), $options: "i" }
}).select("username avatar _id");

    res.json(users);
  } catch (error) {
    handleError(error, res, "Error al buscar usuarios");
  }
};
