import express from "express";
import {
  registerTeacher,
  loginTeacher,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerTeacher);
router.post("/login", loginTeacher);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
