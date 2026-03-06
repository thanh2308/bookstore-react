import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Vui lòng nhập mã khuyến mãi'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: [String],
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Check if promotion is valid
promotionSchema.methods.isValid = function () {
    const now = new Date();

    if (!this.isActive) return false;
    if (now < this.startDate || now > this.endDate) return false;
    if (this.usageLimit && this.usedCount >= this.usageLimit) return false;

    return true;
};

// Calculate discount amount
promotionSchema.methods.calculateDiscount = function (orderAmount) {
    if (!this.isValid() || orderAmount < this.minOrderValue) {
        return 0;
    }

    let discount = 0;

    if (this.discountType === 'percentage') {
        discount = (orderAmount * this.discountValue) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.discountValue;
    }

    return Math.min(discount, orderAmount);
};

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;
