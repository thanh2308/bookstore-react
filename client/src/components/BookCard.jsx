import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlistItem } from "../redux/wishlistSlice";
import { useToast } from "./Toast";
import BookPreviewModal from "./BookPreviewModal";
import { getDisplayRating, getReviewCount } from "../utils/bookReviewUtils";
import { getOptimizedImageUrl } from "../services/api";
import AppIcon from "./AppIcon";
import "./BookCard.css";

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const { success } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist.wishlist || []);

  const [showPreview, setShowPreview] = React.useState(false);
  const bookId = book._id || book.id;
  const stockQuantity = Number.isFinite(book.stock) ? book.stock : book.stockQuantity;
  const isOutOfStock = book.stock === 0 || book.inStock === false || stockQuantity === 0;
  const price = book.salePrice || book.price || 0;
  const originalPrice = book.salePrice ? book.price : book.originalPrice;
  const imageUrl = getOptimizedImageUrl(book.coverImage || book.image, "w_500,f_auto,q_auto");

  const isInWishlist = wishlistItems.some((item) => {
    const itemId = item._id || item;
    return itemId === bookId;
  });

  const handleAddToCart = (event) => {
    event.stopPropagation();
    if (isOutOfStock) return;
    dispatch(addToCart(book));
    success(`Đã thêm "${book.title}" vào giỏ hàng!`);
  };

  const handleToggleWishlist = (event) => {
    event.stopPropagation();
    dispatch(toggleWishlistItem(bookId));
    if (!isInWishlist) {
      success(`Đã thêm "${book.title}" vào yêu thích!`);
    } else {
      success(`Đã xóa "${book.title}" khỏi yêu thích!`);
    }
  };

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const reviewCount = getReviewCount(book);
  const displayRating = getDisplayRating(book);
  const badge = React.useMemo(() => {
    if (book.isNew) return { label: "Mới", className: "new" };
    if (book.isBestseller) return { label: "Bestseller", className: "bestseller" };
    if (isOutOfStock) return { label: "Hết hàng", className: "soldout" };
    if (discountPercent > 0) return { label: `Sale -${discountPercent}%`, className: "sale" };
    return null;
  }, [book.isNew, book.isBestseller, discountPercent, isOutOfStock]);

  return (
    <>
      <div className="book-card">
        <div className="book-image-wrapper">
          <div className="book-card-actions">
            {badge && <div className={`book-badge ${badge.className}`}>{badge.label}</div>}

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`wishlist-btn ${isInWishlist ? "active" : ""}`}
              aria-label={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <AppIcon name="heart" size={18} fill={isInWishlist ? "currentColor" : "none"} />
            </button>
          </div>

          <Link to={`/books/${bookId}`} aria-label={`Xem chi tiết ${book.title}`}>
            <img src={imageUrl} alt={book.title} className="book-image" loading="lazy" />
          </Link>

          <div className="overlay">
            <button
              type="button"
              className="preview-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
            >
              <AppIcon name="eye" size={16} /> Xem nhanh
            </button>
            <button
              type="button"
              className="overlay-cart-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <AppIcon name="cart" size={16} /> {isOutOfStock ? "Hết hàng" : "+ Giỏ hàng"}
            </button>
          </div>
        </div>

        <div className="book-info">
          <div className="book-meta-row">
            <span className="book-category">{book.category}</span>
            {discountPercent > 0 && <span className="sale-note">Tiết kiệm {discountPercent}%</span>}
          </div>

          <Link to={`/books/${bookId}`} className="book-title-link">
            <h3 className="book-title">{book.title}</h3>
          </Link>

          <p className="book-author">Tác giả: {book.author}</p>

          <div className="book-rating">
            <span className="rating-score"><AppIcon name="star" size={14} fill="currentColor" /> {displayRating}</span>
            <span className="rating-count">{reviewCount} đánh giá</span>
          </div>

          <div className="book-price-section">
            <div className="price-wrapper">
              <span className="current-price">
                {price.toLocaleString("vi-VN")}₫
              </span>

              {originalPrice && originalPrice > price && (
                <span className="original-price">
                  {originalPrice.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Hết hàng" : <><AppIcon name="cart" size={16} /> Thêm</>}
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
