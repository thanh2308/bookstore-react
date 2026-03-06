import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateOrderToPaid
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Create order (User) - POST /api/orders
router.post('/', protect, createOrder);

// Get my orders (User) - GET /api/orders/myorders
router.get('/myorders', protect, getMyOrders);

// Get all orders (Admin) - GET /api/orders  
// This must be checked BEFORE /:id to avoid treating "myorders" as ID
router.get('/', protect, getAllOrders);

// Get order by ID - GET /api/orders/:id
router.get('/:id', protect, getOrderById);

// Cancel order (User) - PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, cancelOrder);

// Pay order (User) - PUT /api/orders/:id/pay
router.put('/:id/pay', protect, updateOrderToPaid);

// Update order status (Admin) - PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
