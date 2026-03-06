import Promotion from '../models/Promotion.js';

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
export const getPromotions = async (req, res) => {
    try {
        const { active } = req.query;

        let query = {};
        if (active === 'true') {
            const now = new Date();
            query = {
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            };
        }

        const promotions = await Promotion.find(query).sort('-createdAt');

        res.status(200).json({
            success: true,
            promotions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Public
export const getPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi'
            });
        }

        res.status(200).json({
            success: true,
            promotion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Private
export const validatePromotion = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        const promotion = await Promotion.findOne({ code: code.toUpperCase() });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Mã khuyến mãi không tồn tại'
            });
        }

        if (!promotion.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Mã khuyến mãi không còn hiệu lực'
            });
        }

        if (orderAmount < promotion.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}₫`
            });
        }

        const discount = promotion.calculateDiscount(orderAmount);

        res.status(200).json({
            success: true,
            promotion: {
                code: promotion.code,
                description: promotion.description,
                discount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create promotion
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.create(req.body);

        res.status(201).json({
            success: true,
            promotion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = async (req, res) => {
    try {
        let promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi'
            });
        }

        promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            promotion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khuyến mãi'
            });
        }

        await promotion.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa khuyến mãi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Apply promotion to order
// @route   POST /api/promotions/apply
// @access  Private
export const applyPromotion = async (req, res) => {
    try {
        const { code, userId } = req.body;

        const promotion = await Promotion.findOne({ code: code.toUpperCase() });

        if (!promotion || !promotion.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Mã khuyến mãi không hợp lệ'
            });
        }

        // Add to used list
        promotion.usedBy.push({
            user: userId || req.user._id
        });
        promotion.usedCount += 1;

        await promotion.save();

        res.status(200).json({
            success: true,
            message: 'Áp dụng mã khuyến mãi thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
