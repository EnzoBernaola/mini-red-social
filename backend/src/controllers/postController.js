import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { handleError } from "../utils/handleError.js";


const buildNotification = async (notificationId) => {
  return await Notification.findById(notificationId)
    .populate("fromUser", "username avatar")
    .populate("post", "content");
};

// Obtener posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .populate({
        path: "repostedFrom",
        populate: {
          path: "user",
          select: "username avatar"
        }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    handleError(error, res, "Error obteniendo posts");
  }
};

// Obtener feed
export const getFeed = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);
    const followingIds = (user.following || []).map(id => id.toString());

    // Prioridad: los tuyos y los de la gente que seguís van primero
    const priorityIds = new Set([...followingIds, req.user.id]);

    const posts = await Post.find()
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .populate({
        path: "repostedFrom",
        populate: {
          path: "user",
          select: "username avatar"
        }
      })
      .sort({ createdAt: -1 });

    // Nunca queda vacío: se muestra toda la red, solo que lo que seguís
    // aparece arriba. Dentro de cada grupo, se ordena por fecha.
    const sorted = posts.sort((a, b) => {

      const aIsPriority = priorityIds.has(a.user?._id?.toString());
      const bIsPriority = priorityIds.has(b.user?._id?.toString());

      if (aIsPriority !== bIsPriority) {
        return aIsPriority ? -1 : 1;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(sorted);

  } catch(error){
    handleError(error, res, "Error obteniendo feed");
  }
};

export const getPostById = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id)
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar");


    if (!post) {
      return res.status(404).json({
        msg: "Post no encontrado"
      });
    }


    res.json(post);


  } catch (error) {
    handleError(error, res, "Error obteniendo post");
  }
};

// Crear post
export const createPost = async (req, res) => {
  try {

    const image = req.file ? req.file.path : null;

    const newPost = new Post({
      content: req.body.content,
      user: req.user.id,
      image
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "username avatar");

    const io = req.app.get("io");

    const followers = await User.find({
      following: req.user.id
    }).select("_id");

    io.to(req.user.id).emit("newPost", populatedPost);

    followers.forEach((follower) => {
      io.to(follower._id.toString()).emit("newPost", populatedPost);
    });

    /* =========================
       NOTIFICACIONES
    ========================= */

    if (followers.length > 0) {

      const notifications = followers.map((follower) => ({
        user: follower._id,
        fromUser: req.user.id,
        type: "new_post",
        post: newPost._id
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      for (let notif of createdNotifications) {

        const populatedNotif = await Notification.findById(notif._id)
          .populate("fromUser", "username avatar");

        io.to(populatedNotif.user.toString()).emit("notification", populatedNotif);
      }
    }

    res.status(201).json(populatedPost);

  } catch (error) {
    handleError(error, res, "Error creando post");
  }
};
export const repostPost = async (req, res) => {
  try {

    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({
        msg: "Post no encontrado"
      });
    }

    // No permitir repostear un post propio
    if (originalPost.user.toString() === req.user.id) {
      return res.status(400).json({
        msg: "No puedes repostear tu propio post"
      });
    }

    const repost = await Post.create({
      user: req.user.id,
      repostedFrom: originalPost._id
    });

    const populatedRepost = await Post.findById(repost._id)
      .populate("user", "username avatar")
      .populate({
        path: "repostedFrom",
        populate: {
          path: "user",
          select: "username avatar"
        }
      });

    // Obtener Socket.io
    const io = req.app.get("io");

    // Avisar a los clientes conectados
    io.emit("postReposted", populatedRepost);

    res.json(populatedRepost);

  } catch (error) {

    handleError(error, res, "Error haciendo repost");
  }
};

// Eliminar post
export const deletePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ msg: "No autorizado" });

    // Reposts que dependen de este post: si no los borramos, quedan
    // apuntando a un post que ya no existe.
    const orphanReposts = await Post.find({ repostedFrom: post._id }).select("_id");
    const orphanRepostIds = orphanReposts.map((r) => r._id);

    await Post.deleteMany({
      _id: { $in: [post._id, ...orphanRepostIds] }
    });

    // Notificaciones (like/comentario/etc) que apuntaban a este post:
    // si no las borramos, quedan "huérfanas" y al hacer click no llevan
    // a ningún lado.
    await Notification.deleteMany({ post: post._id });

    const io = req.app.get("io");

    io.emit("postDeleted", {
      postId: post._id
    });

    orphanRepostIds.forEach((id) => {
      io.emit("postDeleted", { postId: id });
    });

    res.json({ msg: "Post eliminado" });

  } catch (error) {
    handleError(error, res, "Error eliminando post");
  }
};

// Editar el texto de un post (no la imagen, ni si es un repost)
export const editPost = async (req, res) => {
  try {

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ msg: "El posteo no puede quedar vacío" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ msg: "No autorizado" });

    if (post.repostedFrom) {
      return res.status(400).json({ msg: "No se puede editar un repost" });
    }

    post.content = content.trim();
    post.edited = true;
    await post.save();

    const updated = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .populate({
        path: "repostedFrom",
        populate: { path: "user", select: "username avatar" }
      });

    const io = req.app.get("io");
    io.emit("postUpdated", updated);

    res.json(updated);

  } catch (error) {
    handleError(error, res, "Error editando post");
  }
};

// Like / dislike post
export const likePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // $pull saca el id del array de forma atómica: MongoDB
      // aplica el cambio directo, sin pisar el resto del documento.
      await Post.findByIdAndUpdate(post._id, { $pull: { likes: userId } });
    } else {
      // $addToSet agrega el id solo si no está ya, también atómico.
      await Post.findByIdAndUpdate(post._id, { $addToSet: { likes: userId } });

      // 🔔 NOTIFICACIÓN (FIX IMPORTANTE)
      if (post.user.toString() !== userId) {

        const notification = await Notification.create({
          user: post.user,
          fromUser: userId,
          type: "like_post",
          post: post._id
        });

        // ✅ POPULATE ANTES DE EMITIR
        const fullNotification = await buildNotification(notification._id);

        req.app.get("io")
          .to(post.user.toString())
          .emit("notification", fullNotification);
      }
    }

    // Volvemos a leer el post ya actualizado para responder con el
    // estado real y actual de los likes (no el que teníamos en memoria).
    const updatedPost = await Post.findById(post._id);

    req.app.get("io").emit("postLiked", {
      postId: updatedPost._id,
      likes: updatedPost.likes
    });

    res.json(updatedPost);

  } catch (error) {
    handleError(error, res, "Error likear post");
  }
};

// Comentar post
export const commentPost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    post.comments.push({
      text: req.body.text,
      user: req.user.id,
      likes: []
    });

    await post.save();
    await post.populate("comments.user", "username avatar");

    const newComment = post.comments[post.comments.length - 1];

    req.app.get("io").emit("postCommented", {
      postId: post._id,
      comment: newComment
    });

    // 🔔 NOTIFICACIÓN FIX
    if (post.user.toString() !== req.user.id) {

      const notification = await Notification.create({
        user: post.user,
        fromUser: req.user.id,
        type: "comment_post",
        post: post._id
      });

      const fullNotification = await buildNotification(notification._id);

      req.app.get("io")
        .to(post.user.toString())
        .emit("notification", fullNotification);
    }

    res.json(post);

  } catch (error) {
    handleError(error, res, "Error comentando");
  }
};
export const deleteComment = async (req, res) => {
  try {

    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ msg: "Comentario no encontrado" });

    if (
      comment.user.toString() !== req.user.id &&
      post.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "No autorizado" });
    }

    post.comments.pull(commentId);
    await post.save();

    req.app.get("io").emit("commentDeleted", {
      postId,
      commentId
    });

    res.json({ msg: "Comentario eliminado" });

  } catch (error) {
    handleError(error, res, "Error eliminando comentario");
  }
};
export const likeComment = async (req, res) => {
  try {

    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ msg: "Comentario no encontrado" });

    const userId = req.user.id;
    const alreadyLiked = comment.likes.includes(userId);

    // El "$" en "comments.$.likes" apunta al comentario específico
    // que matcheó el filtro { "comments._id": commentId }.
    if (alreadyLiked) {
      await Post.updateOne(
        { _id: postId, "comments._id": commentId },
        { $pull: { "comments.$.likes": userId } }
      );
    } else {
      await Post.updateOne(
        { _id: postId, "comments._id": commentId },
        { $addToSet: { "comments.$.likes": userId } }
      );

      // 🔔 NOTIFICACIÓN FIX
      if (comment.user.toString() !== userId) {

        const notification = await Notification.create({
          user: comment.user,
          fromUser: userId,
          type: "like_comment",
          post: post._id
        });

        const fullNotification = await buildNotification(notification._id);

        req.app.get("io")
          .to(comment.user.toString())
          .emit("notification", fullNotification);
      }
    }

    // Releemos para tener el estado real y actual del comentario.
    const updatedPost = await Post.findById(postId);
    const updatedComment = updatedPost.comments.id(commentId);

    req.app.get("io").emit("commentLiked", {
      postId: updatedPost._id,
      commentId: updatedComment._id,
      likes: updatedComment.likes
    });

    res.json(updatedComment);

  } catch (error) {
    handleError(error, res, "Error likear comentario");
  }
};
export const getPostsByUser = async (req, res) => {
  try {

    const posts = await Post.find({
      user: req.params.userId
    })
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .populate({
        path:"repostedFrom",
        populate:{
          path:"user",
          select:"username avatar"
        }
      })
      .sort({ createdAt:-1 });


    res.json(posts);


  } catch(error){
    handleError(error, res, "Error obteniendo posts del usuario");
  }
};