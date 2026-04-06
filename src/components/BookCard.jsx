import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toggleWishlistItem } from '../redux/wishlistSlice';
import { useToast } from './Toast';
import BookPreviewModal from './BookPreviewModal';
import './BookCard.css';

const BookCard = ({ book }) => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const wishlistItems = useSelector(state => state.wishlist.wishlist || []);

    const [showPreview, setShowPreview] = React.useState(false);

    // Check wishlist
    const isInWishlist = wishlistItems.some(item => {
        const itemId = item._id || item;
        const bookId = book._id || book.id;
        return itemId === bookId;
    });

    // Add to cart
    const handleAddToCart = () => {
        dispatch(addToCart(book));
        success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    };

    // Wishlist toggle
    const handleToggleWishlist = () => {
        dispatch(toggleWishlistItem(book._id || book.id));
        if (!isInWishlist) {
            success(`Đã thêm "${book.title}" vào yêu thích!`);
        } else {
            success(`Đã xóa "${book.title}" khỏi yêu thích!`);
        }
    };

    // Discount %
    const discountPercent = book.originalPrice
        ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
        : 0;

    return (
        <>
            <div className="book-card">

                {/* Discount */}
                {discountPercent > 0 && (
                    <div className="discount-badge">-{discountPercent}%</div>
                )}

                {/* Wishlist */}
                <button
                    onClick={handleToggleWishlist}
                    className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                >
                    {isInWishlist ? '❤️' : '🤍'}
                </button>

                {/* IMAGE + HOVER */}
                <div className="book-image-wrapper">
                    <Link to={`/book/${book._id || book.id}`}>
                        <img
                            src={book.image}
                            alt={book.title}
                            className="book-image"
                        />
                    </Link>

                    {/* Overlay hover */}
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

                {/* INFO */}
                <div className="book-info">
                    <span className="book-category">{book.category}</span>

                    <Link to={`/book/${book._id || book.id}`} className="book-title-link">
                        <h3 className="book-title">{book.title}</h3>
                    </Link>

                    <p className="book-author">Tác giả: {book.author}</p>

                    <div className="book-rating">
                        <span>⭐ {book.rating}</span>
                        <span>
                            ({Array.isArray(book.reviews)
                                ? book.reviews.length
                                : (book.numReviews || 0)} đánh giá)
                        </span>
                    </div>

                    {/* PRICE */}
                    <div className="book-price-section">
                        <div className="price-wrapper">
                            <span className="current-price">
                                {book.price.toLocaleString('vi-VN')}₫
                            </span>

                            {book.originalPrice && (
                                <span className="original-price">
                                    {book.originalPrice.toLocaleString('vi-VN')}₫
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="add-to-cart-btn"
                            disabled={!book.inStock}
                        >
                            {book.inStock ? '🛒 Thêm' : 'Hết hàng'}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <BookPreviewModal
                book={book}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />
        </>
    );
};

export default BookCard;