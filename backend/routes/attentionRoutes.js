import express from "express";
import { recordAttention } from "../controllers/attentionController.js";

const router = express.Router();

// Public — called directly from each student's browser tab every second
router.post("/", recordAttention);

export default router;
