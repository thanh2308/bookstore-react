import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBookById, addBookReview } from "../redux/booksSlice";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlistItem } from "../redux/wishlistSlice";
import { useToast } from "../components/Toast";
import BookCard from "../components/BookCard";
import { getDisplayRating, getReviewCount } from "../utils/bookReviewUtils";
import "./BookDetail.css";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success } = useToast();

  const { loading, error } = useSelector((state) => state.books);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const book = useSelector((state) => state.books.currentBook);

  const relatedBooks = useSelector((state) =>
    state.books.allBooks
      .filter(
        (b) =>
          b.category === book?.category &&
          (b._id || b.id) !== (book._id || book.id),
      )
      .slice(0, 4),
  );

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    dispatch(fetchBookById(id));
  }, [id, dispatch]);

  const isInWishlist = wishlist.some((w) => w === id || w._id === id);

  const handleAddToCart = () => {
    if (!book) return;
    dispatch(addToCart({ ...book, quantity }));
    success(`Đã thêm ${quantity} cuốn vào giỏ hàng!`);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(toggleWishlistItem(id));
    success(isInWishlist ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert("Vui lòng nhập nhận xét");
      return;
    }

    const result = await dispatch(
      addBookReview({
        id,
        reviewData: {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        },
      }),
    );

    if (addBookReview.fulfilled.match(result)) {
      success("Đánh giá đã được gửi!");
      setReviewForm({ rating: 5, comment: "" });
      dispatch(fetchBookById(id));
    } else {
      alert(result.payload || "Không gửi được đánh giá");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="book-detail-skeleton">
          <div className="skeleton skeleton-detail-image-wrapper"></div>
          <div className="skeleton-detail-info">
            <div className="skeleton skeleton-detail-badge"></div>
            <div className="skeleton skeleton-detail-title"></div>
            <div className="skeleton skeleton-detail-text"></div>
            <div
              className="skeleton skeleton-detail-text"
              style={{ width: "40%" }}
            ></div>
            <div className="skeleton skeleton-detail-block"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && (error || !book)) {
    return (
      <div className="container">
        <div className="error-state">
          <p>❌ {error || "Không tìm thấy sách"}</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const discountPercent = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;
  const visibleReviewCount = getReviewCount(book, { source: "array" });
  const totalReviewCount = getReviewCount(book, { source: "numReviews" });

  return (
    <div className="book-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <span onClick={() => navigate("/")} className="breadcrumb-link">
            Trang chủ
          </span>
          <span>/</span>
          <span>{book.category}</span>
          <span>/</span>
          <span>{book.title}</span>
        </div>

        <div className="book-detail-grid">
          <div className="book-detail-image-wrapper">
            {discountPercent > 0 && (
              <div className="discount-badge">-{discountPercent}%</div>
            )}
            <img
              src={book.image}
              alt={book.title}
              className="book-detail-image"
            />
            <button
              onClick={handleToggleWishlist}
              className={`wishlist-btn ${isInWishlist ? "active" : ""}`}
            >
              {isInWishlist ? "❤️" : "🤍"}
            </button>
          </div>

          <div className="book-detail-info">
            <span className="book-category-badge">{book.category}</span>
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">
              Tác giả: <strong>{book.author}</strong>
            </p>

            <div className="book-rating-section">
              <span className="rating-stars">
                ⭐ {getDisplayRating(book, { source: "array" })}
              </span>
              <span className="rating-reviews">
                ({visibleReviewCount} đánh giá)
              </span>
            </div>

            <div className="book-price-section">
              <div className="price-group">
                <span className="current-price-large">
                  {book.price.toLocaleString("vi-VN")}₫
                </span>
                {book.originalPrice && (
                  <span className="original-price-large">
                    {book.originalPrice.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
            </div>

            <div className="book-meta">
              {book.isbn && (
                <div className="meta-item">
                  <span className="meta-label">ISBN:</span>
                  <span className="meta-value">{book.isbn}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Tình trạng:</span>
                <span
                  className={`meta-value ${book.inStock ? "in-stock" : "out-of-stock"}`}
                >
                  {book.inStock ? "✓ Còn hàng" : "✗ Hết hàng"}
                </span>
              </div>
            </div>

            <div className="purchase-controls">
              {book.inStock ? (
                <>
                  <div className="quantity-selector">
                    <label>Số lượng:</label>
                    <div className="quantity-input-group">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        min="1"
                      />
                      <button onClick={() => setQuantity(quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="btn btn-primary btn-large"
                  >
                    🛒 Thêm vào giỏ hàng
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary btn-large" disabled>
                  ✗ Hết hàng
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="book-tabs">
          <div className="tabs-header">
            <button
              className={`tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả
            </button>
            <button
              className={`tab ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá ({visibleReviewCount})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "description" && (
              <div className="description-tab">
                <p>{book.description}</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-tab">
                {isAuthenticated ? (
                  <div className="review-form">
                    <h3>Viết đánh giá của bạn</h3>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="form-group">
                        <label>Đánh giá:</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              rating: parseInt(e.target.value),
                            })
                          }
                        >
                          <option value="5">⭐⭐⭐⭐⭐ Tuyệt vời</option>
                          <option value="4">⭐⭐⭐⭐ Tốt</option>
                          <option value="3">⭐⭐⭐ Trung bình</option>
                          <option value="2">⭐⭐ Kém</option>
                          <option value="1">⭐ Rất kém</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nhận xét:</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              comment: e.target.value,
                            })
                          }
                          required
                          rows="4"
                          placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Gửi đánh giá
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="login-prompt">
                    <button
                      onClick={() => navigate("/login")}
                      className="btn btn-link"
                    >
                      Đăng nhập
                    </button>{" "}
                    để viết đánh giá
                  </p>
                )}

                <div className="reviews-list">
                  {book.reviews && book.reviews.length > 0 ? (
                    book.reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <span className="reviewer-name">
                            {review.name || "Anonymous"}
                          </span>
                          <span className="review-rating">
                            {"⭐".repeat(review.rating)}
                          </span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        {review.createdAt && (
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        )}
                      </div>
                    ))
                  ) : totalReviewCount > 0 ? (
                    <p className="no-reviews">
                      Hiện chưa có danh sách đánh giá chi tiết để hiển thị.
                    </p>
                  ) : (
                    <p className="no-reviews">
                      Chưa có đánh giá nào. Hãy là người đầu tiên!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <section className="related-books-section">
          <div className="container">
            <h2>Sách Liên Quan</h2>
            <div className="related-books-grid">
              {relatedBooks.map((relatedBook) => (
                <BookCard
                  key={relatedBook._id || relatedBook.id}
                  book={relatedBook}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetail;
