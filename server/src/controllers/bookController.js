import Book from "../models/Book.js";

// @desc    Get all books with filters
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const { category, search, sortBy, minPrice, maxPrice } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20),
    );

    // Build query
    let query = {};

    if (category && category !== "Tất cả") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
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
      case "price-asc":
        sort.price = 1;
        break;
      case "price-desc":
        sort.price = -1;
        break;
      case "rating":
        sort.rating = -1;
        break;
      case "name":
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
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "reviews.user",
      "name",
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = async (req, res) => {
  try {
    // Trim keys để remove trailing spaces
    const bookData = {};
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        bookData[key.trim()] = req.body[key].trim();
      } else {
        bookData[key.trim()] = req.body[key];
      }
    }

    console.log("bookData after trim:", bookData);

    // Convert string to number
    if (bookData.price) bookData.price = Number(bookData.price);
    if (bookData.originalPrice)
      bookData.originalPrice = Number(bookData.originalPrice);
    if (bookData.stockQuantity)
      bookData.stockQuantity = Number(bookData.stockQuantity);

    // Handle image - trim fieldname
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find((f) => f.fieldname.trim() === "image");
      if (imageFile) {
        bookData.image = imageFile.path;
      }
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Không tìm thấy sách",
      });
    }

    const updateData = { ...req.body };

    // Convert string to number
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.originalPrice)
      updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.stockQuantity)
      updateData.stockQuantity = Number(updateData.stockQuantity);

    // If file uploaded (Cloudinary), update image URL
    if (req.file) {
      updateData.image = req.file.path;
    }

    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Không tìm thấy sách",
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Đã xóa sách thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ratingNumber = Number(rating);
    const commentText = typeof comment === "string" ? comment.trim() : "";

    if (
      !Number.isInteger(ratingNumber) ||
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Điểm đánh giá phải từ 1 đến 5",
      });
    }

    if (!commentText || commentText.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Nội dung đánh giá phải từ 1 đến 1000 ký tự",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sách này rồi",
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: ratingNumber,
      comment: commentText,
    };

    book.reviews.push(review);
    book.calculateRating();

    await book.save();

    res.status(201).json({
      success: true,
      message: "Đánh giá đã được thêm",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update stock quantity
// @route   PUT /api/books/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res) => {
  try {
    const stockQuantity = Number(req.body.stockQuantity);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng tồn kho phải là số nguyên không âm",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    book.stockQuantity = stockQuantity;
    await book.save();

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
