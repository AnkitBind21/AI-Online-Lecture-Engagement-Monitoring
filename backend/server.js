import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import attentionRoutes from "./routes/attentionRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { initSocketServer } from "./socket/socketServer.js";

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "EduSense AI Backend is running" });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attention", attentionRoutes);
app.use("/api/settings", settingsRoutes);

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── HTTP server (Socket.IO needs the raw http.Server, not app.listen) ────────
const httpServer = http.createServer(app);

// ── Attach Socket.IO ──────────────────────────────────────────────────────────
initSocketServer(httpServer);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );
  console.log(`🔌 Socket.IO attached and listening`);
});
