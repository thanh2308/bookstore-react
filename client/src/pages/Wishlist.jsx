import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWishlist, toggleWishlistItem } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import { useToast } from "../components/Toast";
import { getDisplayRating, getReviewCount } from "../utils/bookReviewUtils";
import "./Wishlist.css";

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success } = useToast();

  const { wishlist, loading, error } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated, navigate]);

  const wishlistBooks = (wishlist || [])
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return item;
      }
      return null;
    })
    .filter(Boolean);

  const handleRemove = (bookId) => {
    dispatch(toggleWishlistItem(bookId));
    success("Đã xóa khỏi danh sách yêu thích");
  };

  const handleAddToCart = (book) => {
    dispatch(addToCart({ ...book, quantity: 1 }));
    success("Đã thêm vào giỏ hàng!");
  };

  const handleViewDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-state">
          <p>❌ {error}</p>
          <button
            onClick={() => dispatch(fetchWishlist())}
            className="btn btn-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1>Danh Sách Yêu Thích</h1>
        <p className="wishlist-subtitle">
          {wishlistBooks.length} sách trong danh sách của bạn
        </p>

        {wishlistBooks.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">💔</div>
            <h2>Danh sách yêu thích trống</h2>
            <p>Bạn chưa thêm sách nào vào danh sách yêu thích.</p>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Khám phá sách
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistBooks.map((book) => (
              <div key={book._id || book.id} className="wishlist-item">
                <div className="wishlist-item-image">
                  <img src={book.image} alt={book.title} />
                  {!book.inStock && (
                    <div className="out-of-stock-overlay">Hết hàng</div>
                  )}
                </div>

                <div className="wishlist-item-details">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <div className="rating">
                    <span className="stars">⭐ {getDisplayRating(book)}</span>
                    <span className="reviews">
                      ({getReviewCount(book)} đánh giá)
                    </span>
                  </div>
                  <div className="price">
                    <span className="current-price">
                      {book.price.toLocaleString("vi-VN")}₫
                    </span>
                    {book.originalPrice && (
                      <span className="original-price">
                        {book.originalPrice.toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  </div>
                </div>

                <div className="wishlist-item-actions">
                  <button
                    onClick={() => handleAddToCart(book)}
                    className={`btn ${book.inStock ? "btn-primary" : "btn-secondary"}`}
                    disabled={!book.inStock}
                  >
                    {book.inStock ? "🛒 Thêm vào giỏ hàng" : "Hết hàng"}
                  </button>
                  <button
                    onClick={() => handleViewDetails(book._id || book.id)}
                    className="btn btn-outline"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleRemove(book._id || book.id)}
                    className="btn btn-danger"
                  >
                    ❌ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {wishlistBooks.length > 0 && (
          <div className="wishlist-actions">
            <button
              onClick={() => {
                wishlistBooks.forEach((book) => {
                  if (book.inStock) {
                    handleAddToCart(book);
                  }
                });
              }}
              className="btn btn-primary"
            >
              🛒 Thêm tất cả vào giỏ hàng
            </button>
            <button onClick={() => navigate("/")} className="btn btn-outline">
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
