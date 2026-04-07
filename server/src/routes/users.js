import express from 'express';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserBlock,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getWishlist,
    getAllWishlists
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE parameterized routes (:id)

// User routes - Wishlist (MUST be before /:id)
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:bookId', protect, toggleWishlist);

// Admin routes - Wishlist analytics (MUST be before /:id)
router.get('/wishlists/all', protect, adminOnly, getAllWishlists);

// Admin routes - General
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.put('/:id/block', protect, adminOnly, toggleUserBlock);
router.delete('/:id', protect, adminOnly, deleteUser);

// User routes - Address
router.post('/address', protect, addAddress);
router.put('/address/:addressId', protect, updateAddress);
router.delete('/address/:addressId', protect, deleteAddress);

export default router;
