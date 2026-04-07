import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getAnalyticsSummary, getRevenueAnalytics, getTopBooks } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', protect, adminOnly, getAnalyticsSummary);
router.get('/revenue', protect, adminOnly, getRevenueAnalytics);
router.get('/top-books', protect, adminOnly, getTopBooks);

export default router;