import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toggleWishlist } from '../redux/wishlistSlice';
import { useToast } from './Toast';
import BookPreviewModal from './BookPreviewModal';
import './BookCard.css';

const BookCard = ({ book }) => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const wishlistItems = useSelector(state => state.wishlist.items);
    const isInWishlist = wishlistItems.includes(book.id);
    const [showPreview, setShowPreview] = useState(false);

    const handleAddToCart = () => {
        dispatch(addToCart(book));
        success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    };

    const handleToggleWishlist = () => {
        dispatch(toggleWishlist(book.id));
        if (!isInWishlist) {
            success(`Đã thêm "${book.title}" vào danh sách yêu thích!`);
        }
    };

    const discountPercent = book.originalPrice
        ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
        : 0;

    return (
        <div className="book-card">
            {discountPercent > 0 && <div className="discount-badge">-{discountPercent}%</div>}

            <button
                onClick={handleToggleWishlist}
                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
                {isInWishlist ? '❤️' : '🤍'}
            </button>

            <Link to={`/book/${book.id}`} className="book-image-wrapper">
                <img src={book.image} alt={book.title} className="book-image" />
                <button
                    onClick={(e) => { e.preventDefault(); setShowPreview(true); }}
                    className="preview-btn"
                >
                    👁️ Đọc thử
                </button>
            </Link>

            <div className="book-info">
                <span className="book-category">{book.category}</span>
                <Link to={`/book/${book.id}`} className="book-title-link">
                    <h3 className="book-title">{book.title}</h3>
                </Link>
                <p className="book-author">Tác giả: {book.author}</p>

                <div className="book-rating">
                    <span className="stars">⭐ {book.rating}</span>
                    <span className="reviews">({book.reviews} đánh giá)</span>
                </div>

                <div className="book-price-section">
                    <div className="price-wrapper">
                        <span className="current-price">{book.price.toLocaleString('vi-VN')}₫</span>
                        {book.originalPrice && (
                            <span className="original-price">{book.originalPrice.toLocaleString('vi-VN')}₫</span>
                        )}
                    </div>

                    <button onClick={handleAddToCart} className="add-to-cart-btn" disabled={!book.inStock}>
                        {book.inStock ? '🛒 Thêm' : 'Hết hàng'}
                    </button>
                </div>
            </div>

            <BookPreviewModal
                book={book}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />
        </div>
    );
};

export default BookCard;
