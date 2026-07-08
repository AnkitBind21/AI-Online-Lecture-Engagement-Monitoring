import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  deleteReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All report routes require authentication
router.post("/", protect, createReport);
router.get("/", protect, getReports);
router.get("/:id", protect, getReportById);
router.delete("/:id", protect, deleteReport);

export default router;
