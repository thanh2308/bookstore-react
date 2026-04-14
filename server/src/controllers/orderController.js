import Order from "../models/Order.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} from "../services/emailService.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  let session;

  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes,
      customer,
      promotionCode,
      orderNumber,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống",
      });
    }

    session = await Book.startSession();
    session.startTransaction();

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        const quantityError = new Error(
          `Số lượng không hợp lệ cho sản phẩm: ${item.title || item.book || item.id}`,
        );
        quantityError.statusCode = 400;
        throw quantityError;
      }

      const book = await Book.findById(item.book || item.id).session(session);

      if (!book) {
        const notFoundError = new Error(`Không tìm thấy sách: ${item.title}`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (book.stockQuantity < item.quantity) {
        const stockError = new Error(`Sách "${book.title}" không đủ số lượng`);
        stockError.statusCode = 400;
        throw stockError;
      }

      orderItems.push({
        book: book._id,
        title: book.title,
        quantity: item.quantity,
        price: book.price,
        image: book.image,
      });

      itemsPrice += book.price * item.quantity;

      book.stockQuantity -= item.quantity;
      await book.save({ session });
    }

    let discount = 0;
    let finalPromotionCode = null;

    if (promotionCode) {
      const { default: Promotion } = await import("../models/Promotion.js");
      const promotion = await Promotion.findOne({
        code: promotionCode.toUpperCase(),
      }).session(session);

      if (
        promotion &&
        promotion.isValid() &&
        itemsPrice >= promotion.minOrderValue
      ) {
        discount = promotion.calculateDiscount(itemsPrice);
        finalPromotionCode = promotion.code;

        promotion.usedCount += 1;
        promotion.usedBy.push({ user: req.user._id });
        await promotion.save({ session });
      }
    }

    const totalPrice = Math.max(itemsPrice - discount, 0);

    const [order] = await Order.create(
      [
        {
          orderNumber: orderNumber || `ORD-${Date.now()}`,
          user: req.user._id,
          customer: customer || {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || shippingAddress?.phone,
          },
          items: orderItems,
          shippingAddress,
          paymentMethod: paymentMethod || "COD",
          itemsPrice,
          shippingPrice: 0,
          totalPrice,
          discount,
          promotionCode: finalPromotionCode,
          notes,
        },
      ],
      { session },
    );

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orderHistory: order._id } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
    session = null;

    sendOrderConfirmation(order, {
      name: order.customer.name,
      email: order.customer.email,
    }).catch((err) => console.error("Email sending failed:", err));

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.book", "title image")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.book", "title image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Check if user owns this order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập đơn hàng này",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Không tìm thấy đơn hàng",
      });
    }

    order.status = status;

    if (note) {
      order.statusHistory[order.statusHistory.length - 1].note = note;
    }

    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }

    if (status === "cancelled") {
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

    const user = await import("../models/User.js").then((m) =>
      m.default.findById(order.user),
    );
    if (user) {
      sendOrderStatusUpdate(order, {
        name: user.name,
        email: user.email,
      }).catch((err) => console.error("Email sending failed:", err));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền hủy đơn hàng này",
      });
    }

    // Only allow cancel if order is pending
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng đã được xác nhận",
      });
    }

    order.status = "cancelled";
    order.cancelledAt = Date.now();
    order.cancelReason = req.body.reason || "Khách hàng hủy";

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
      message: "Đã hủy đơn hàng",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Không tìm thấy đơn hàng",
      });
    }

    const isOrderOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOrderOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật thanh toán cho đơn hàng này",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        order,
      });
    }

    order.paymentStatus = "paid";
    order.paymentDetails = {
      transactionId: req.body.transactionId,
      paidAt: Date.now(),
    };

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
