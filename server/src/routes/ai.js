import express from "express";
import { chat, analyzeOnly } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/chat  – Main chatbot endpoint
router.post("/chat", chat);

// POST /api/ai/analyze – Debug/inspect AI analysis
router.post("/analyze", analyzeOnly);

export default router;
