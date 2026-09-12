import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  likePost,
  commentPost,
  deleteComment,
  likeComment,
  getPostsByUser,
  getFeed,
  repostPost
} from "../controllers/postController.js";

import upload from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createPostValidation, commentValidation } from "../validators/postValidators.js";

const router = express.Router();

router.get("/feed", protect, getFeed);

// Crear post con imagen
router.post("/", protect, upload.single("image"), createPostValidation, validate, createPost);
// Repostear post
router.post("/:id/repost", protect, repostPost);
// obtener TODOS los posts
router.get("/", protect, getPosts);

// posts por usuario
router.get("/user/:userId", protect, getPostsByUser);

// obtener un post por id
router.get("/:id", protect, getPostById);

// likes
router.put("/like/:id", protect, likePost);

// comentarios
router.post("/:id/comment", protect, commentValidation, validate, commentPost);
router.put("/:postId/comment/:commentId/like", protect, likeComment);
router.delete("/:postId/comment/:commentId", protect, deleteComment);

// borrar post
router.delete("/:id", protect, deletePost);

export default router;