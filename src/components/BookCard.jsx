import React, { useState } from 'react';
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

    // Handle both populated objects and ID strings
    const isInWishlist = wishlistItems.some(item => {
        const itemId = item._id || item;
        const bookId = book._id || book.id;
        return itemId === bookId;
    });

    const [showPreview, setShowPreview] = useState(false);

    const handleAddToCart = () => {
        dispatch(addToCart(book));
        success(`Đã thêm "${book.title}" vào giỏ hàng!`);
    };

    const handleToggleWishlist = () => {
        dispatch(toggleWishlistItem(book._id || book.id));
        if (!isInWishlist) {
            success(`Đã thêm "${book.title}" vào danh sách yêu thích!`);
        } else {
            success(`Đã xóa "${book.title}" khỏi danh sách yêu thích!`);
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
                {isInWishlist ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3.25 7.5 3.25c1.548 0 3.09.99 3.75 2.414.66-1.424 2.201-2.414 3.75-2.414 2.786 0 5.25 2.072 5.25 5.004 0 3.936-2.439 7.115-4.737 9.25a24.872 24.872 0 0 1-4.258 3.167c-.201.127-.41.253-.618.368l-.025.013-.008.004c-.004.002-.007.004-.01.006l-.004.002-.001.001-.001.001h-.001l-.001-.001a.34.34 0 0 1-.01-.007Z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                )}
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
                    <span className="reviews">({Array.isArray(book.reviews) ? book.reviews.length : (book.numReviews || 0)} đánh giá)</span>
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
