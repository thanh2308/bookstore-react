import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlistItem } from "../redux/wishlistSlice";
import { useToast } from "./Toast";
import BookPreviewModal from "./BookPreviewModal";
import { getDisplayRating, getReviewCount } from "../utils/bookReviewUtils";
import "./BookCard.css";

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const { success } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist.wishlist || []);

  const [showPreview, setShowPreview] = React.useState(false);

  const isInWishlist = wishlistItems.some((item) => {
    const itemId = item._id || item;
    const bookId = book._id || book.id;
    return itemId === bookId;
  });

  const handleAddToCart = () => {
    dispatch(addToCart(book));
    success(`Đã thêm "${book.title}" vào giỏ hàng!`);
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlistItem(book._id || book.id));
    if (!isInWishlist) {
      success(`Đã thêm "${book.title}" vào yêu thích!`);
    } else {
      success(`Đã xóa "${book.title}" khỏi yêu thích!`);
    }
  };

  const discountPercent = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <>
      <div className="book-card">
        {discountPercent > 0 && (
          <div className="discount-badge">-{discountPercent}%</div>
        )}

        <button
          onClick={handleToggleWishlist}
          className={`wishlist-btn ${isInWishlist ? "active" : ""}`}
        >
          {isInWishlist ? "❤️" : "🤍"}
        </button>

        <div className="book-image-wrapper">
          <Link to={`/book/${book._id || book.id}`}>
            <img src={book.image} alt={book.title} className="book-image" />
          </Link>

          <div className="overlay">
            <button
              className="preview-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
            >
              👁️ Đọc thử
            </button>
          </div>
        </div>

        <div className="book-info">
          <span className="book-category">{book.category}</span>

          <Link to={`/book/${book._id || book.id}`} className="book-title-link">
            <h3 className="book-title">{book.title}</h3>
          </Link>

          <p className="book-author">Tác giả: {book.author}</p>

          <div className="book-rating">
            <span>⭐ {getDisplayRating(book)}</span>
            <span>({getReviewCount(book)} đánh giá)</span>
          </div>

          <div className="book-price-section">
            <div className="price-wrapper">
              <span className="current-price">
                {book.price.toLocaleString("vi-VN")}₫
              </span>

              {book.originalPrice && (
                <span className="original-price">
                  {book.originalPrice.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              disabled={!book.inStock}
            >
              {book.inStock ? "🛒 Thêm" : "Hết hàng"}
            </button>
          </div>
        </div>
      </div>

      <BookPreviewModal
        book={book}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};

export const BookCardSkeleton = () => (
  <div className="book-card-skeleton">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-content-wrapper">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text" style={{ width: "40%" }}></div>
      <div className="skeleton skeleton-price"></div>
    </div>
  </div>
);

export default BookCard;
