import express from "express";
import {
  createRoom,
  getMyRooms,
  joinRoom,
  getRoomByCode,
  startSession,
  endSession,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Private — teacher must be logged in
router.post("/create", protect, createRoom);
router.get("/", protect, getMyRooms);
router.delete("/:id", protect, deleteRoom);

// Public — student-facing
router.post("/join", joinRoom);
router.get("/:roomCode", getRoomByCode);

// Lecture lifecycle — private
router.post("/:roomCode/start", protect, startSession);
router.post("/:roomCode/end", protect, endSession);

export default router;
