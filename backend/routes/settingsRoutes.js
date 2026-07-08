import express from "express";
import {
  getSettings,
  updateProfile,
  updatePassword,
  updateTheme,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All settings routes are private
router.get("/", protect, getSettings);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.put("/theme", protect, updateTheme);

export default router;
