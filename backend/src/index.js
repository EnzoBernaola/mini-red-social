import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";

import connectDB from "./config/db.js";

import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// =========================
// MIDDLEWARES
// =========================

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use(express.json());

// =========================
// STATIC FILES
// =========================

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Permite acceder a Socket.IO desde los controllers
app.set("io", io);

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// =========================
// ONLINE USERS
// =========================

const onlineUsers = new Set();

const emitOnlineUsers = () => {
  io.emit("onlineUsers", [...onlineUsers]);
};

io.on("connection", (socket) => {
  console.log("Nuevo socket conectado:", socket.id);

  // =========================
  // JOIN
  // =========================

  socket.on("join", (userId) => {
    if (!userId) return;

    if (socket.userId && socket.userId !== userId) {
      onlineUsers.delete(socket.userId);
    }

    socket.userId = userId;

    socket.join(userId);
    onlineUsers.add(userId);

    emitOnlineUsers();

    console.log(`Usuario ${userId} conectado`);
  });

  // =========================
  // LOGOUT
  // =========================

  socket.on("logout", () => {
    if (!socket.userId) return;

    console.log(`Usuario ${socket.userId} cerró sesión`);

    onlineUsers.delete(socket.userId);

    socket.leave(socket.userId);

    socket.userId = null;

    emitOnlineUsers();
  });

  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", () => {
    if (!socket.userId) return;

    console.log(`Usuario ${socket.userId} desconectado`);

    onlineUsers.delete(socket.userId);

    emitOnlineUsers();
  });
});

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    msg: "Ruta no encontrada",
  });
});

// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error("Error del servidor:", err);

  res.status(err.status || 500).json({
    msg: err.message || "Error interno del servidor",
  });
});

// =========================
// START SERVER
// =========================

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error iniciando servidor:", error);
    process.exit(1);
  }
};

startServer();