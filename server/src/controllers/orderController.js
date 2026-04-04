import Order from '../models/Order.js';
import Book from '../models/Book.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../services/emailService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes, customer, promotionCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        // Calculate prices and check stock
        let itemsPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const book = await Book.findById(item.book || item.id);

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sách: ${item.title}`
                });
            }

            if (book.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Sách "${book.title}" không đủ số lượng`
                });
            }

            orderItems.push({
                book: book._id,
                title: book.title,
                quantity: item.quantity,
                price: book.price,
                image: book.image
            });

            itemsPrice += book.price * item.quantity;

            book.stockQuantity -= item.quantity;
            await book.save();
        }

        let discount = 0;
        let finalPromotionCode = null;

        if (promotionCode) {
            const { default: Promotion } = await import('../models/Promotion.js');
            const promotion = await Promotion.findOne({ code: promotionCode.toUpperCase() });
            
            if (promotion && promotion.isValid() && itemsPrice >= promotion.minOrderValue) {
                discount = promotion.calculateDiscount(itemsPrice);
                finalPromotionCode = promotion.code;
                
                promotion.usedCount += 1;
                promotion.usedBy.push({ user: req.user._id });
                await promotion.save();
            }
        }

        const totalPrice = itemsPrice - discount;

        const order = await Order.create({
            user: req.user._id,
            customer: customer || {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone || shippingAddress.phone
            },
            items: orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            itemsPrice,
            shippingPrice: 0,
            totalPrice,
            discount,
            promotionCode: finalPromotionCode,
            notes
        });

        // Add to user's order history
        req.user.orderHistory.push(order._id);
        await req.user.save();

        // Send confirmation email
        sendOrderConfirmation(order, {
            name: order.customer.name,
            email: order.customer.email
        }).catch(err => console.error('Email sending failed:', err));

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.book', 'title image')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.book', 'title image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập đơn hàng này'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = {};

        // If not admin, only show user's own orders
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        order.status = status;

        if (note) {
            order.statusHistory[order.statusHistory.length - 1].note = note;
        }

        if (status === 'delivered') {
            order.deliveredAt = Date.now();
        }

        if (status === 'cancelled') {
            order.cancelledAt = Date.now();
            order.cancelReason = note;

            for (const item of order.items) {
                const book = await Book.findById(item.book);
                if (book) {
                    book.stockQuantity += item.quantity;
                    await book.save();
                }
            }
        }

        await order.save();

        const user = await import('../models/User.js').then(m => m.default.findById(order.user));
        if (user) {
            sendOrderStatusUpdate(order, {
                name: user.name,
                email: user.email
            }).catch(err => console.error('Email sending failed:', err));
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền hủy đơn hàng này'
            });
        }

        // Only allow cancel if order is pending
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đã được xác nhận'
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = Date.now();
        order.cancelReason = req.body.reason || 'Khách hàng hủy';

        // Restore stock
        for (const item of order.items) {
            const book = await Book.findById(item.book);
            if (book) {
                book.stockQuantity += item.quantity;
                await book.save();
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Đã hủy đơn hàng',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        order.paymentStatus = 'paid';
        order.paymentDetails = {
            transactionId: req.body.transactionId,
            paidAt: Date.now()
        };

        await order.save();

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
