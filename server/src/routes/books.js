import express from 'express';
import {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    addReview,
    updateStock
} from '../controllers/bookController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/:id', getBook);

// Protected routes
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.post('/', protect, adminOnly, upload.any(), createBook);
router.put('/:id', protect, adminOnly, upload.single('image'), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);
router.put('/:id/stock', protect, adminOnly, updateStock);

export default router;
