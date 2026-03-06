import Book from '../models/Book.js';

// @desc    Get all books with filters
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
    try {
        const { category, search, sortBy, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

        // Build query
        let query = {};

        if (category && category !== 'Tất cả') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Build sort
        let sort = {};
        switch (sortBy) {
            case 'price-asc':
                sort.price = 1;
                break;
            case 'price-desc':
                sort.price = -1;
                break;
            case 'rating':
                sort.rating = -1;
                break;
            case 'name':
                sort.title = 1;
                break;
            default:
                sort.createdAt = -1;
        }

        // Execute query with pagination
        const books = await Book.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            books,
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

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('reviews.user', 'name');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách'
            });
        }

        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = async (req, res) => {
    try {
        const bookData = { ...req.body };

        // If file uploaded, add image path
        if (req.file) {
            bookData.image = `/uploads/books/${req.file.filename}`;
        }

        const book = await Book.create(bookData);

        res.status(201).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách'
            });
        }

        const updateData = { ...req.body };

        // If file uploaded, update image path
        if (req.file) {
            updateData.image = `/uploads/books/${req.file.filename}`;
        }

        book = await Book.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách'
            });
        }

        await book.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa sách thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách'
            });
        }

        // Check if user already reviewed
        const alreadyReviewed = book.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá sách này rồi'
            });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        book.reviews.push(review);
        book.calculateRating();

        await book.save();

        res.status(201).json({
            success: true,
            message: 'Đánh giá đã được thêm',
            book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update stock quantity
// @route   PUT /api/books/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res) => {
    try {
        const { stockQuantity } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách'
            });
        }

        book.stockQuantity = stockQuantity;
        await book.save();

        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
