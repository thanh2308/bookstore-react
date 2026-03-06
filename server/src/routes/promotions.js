import express from 'express';
import {
    getPromotions,
    getPromotion,
    validatePromotion,
    createPromotion,
    updatePromotion,
    deletePromotion,
    applyPromotion
} from '../controllers/promotionController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPromotions);
router.get('/:id', getPromotion);

// User routes
router.post('/validate', protect, validatePromotion);
router.post('/apply', protect, applyPromotion);

// Admin routes
router.post('/', protect, adminOnly, createPromotion);
router.put('/:id', protect, adminOnly, updatePromotion);
router.delete('/:id', protect, adminOnly, deletePromotion);

export default router;
