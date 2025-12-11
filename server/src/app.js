require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http"); // Import HTTP
const { Server } = require("socket.io"); // Import Socket.io

const logger = require("./utils/logger");
const { connectDB } = require("./utils/database");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const notificationRoutes = require("./routes/notifications"); // We will create this next

/**
 * Express application setup
 */
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend connection
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 3. User Tracking (Map UserId -> SocketId)
// This lets us send a message to a specific person (e.g., "User 5")
global.userSocketMap = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId && userId !== "undefined") {
    global.userSocketMap.set(userId, socket.id);
    console.log(`[SOCKET] User ${userId} connected (Socket ID: ${socket.id})`);
  }

  socket.on("disconnect", () => {
    if (userId) {
      global.userSocketMap.delete(userId);
      console.log(`[SOCKET] User ${userId} disconnected`);
    }
  });
});

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. Attach 'io' to every request
// This allows Controllers (like 'likePost') to send notifications
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Debug Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes); // Register new route

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.critical("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

const startServer = async () => {
  try {
    await connectDB();
    // CHANGED: app.listen -> server.listen
    server.listen(PORT, "0.0.0.0", () => {
      logger.verbose(`Server is running on port ${PORT}`);
      logger.verbose(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.critical("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;