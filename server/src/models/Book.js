import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tên sách'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Vui lòng nhập tên tác giả'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục'],
        enum: ['Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Kinh tế', 'Văn học Việt Nam', 'Thiếu nhi']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sách']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sách'],
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    image: {
        type: String,
        required: [true, 'Vui lòng upload hình ảnh']
    },
    isbn: {
        type: String,
        required: [true, 'Vui lòng nhập ISBN'],
        unique: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    inStock: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [reviewSchema]
}, {
    timestamps: true
});

// Update stock status based on quantity
bookSchema.pre('save', function (next) {
    this.inStock = this.stockQuantity > 0;
    next();
});

// Calculate average rating
bookSchema.methods.calculateRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating = sum / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
};

bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ rating: -1 });
const Book = mongoose.model('Book', bookSchema);
export default Book;
