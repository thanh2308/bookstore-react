import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import BookCard from '../components/BookCard';
import './BookDetail.css';

const BookDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);

    const book = useSelector(state =>
        state.books.allBooks.find(b => b.id === parseInt(id))
    );

    const relatedBooks = useSelector(state =>
        state.books.allBooks.filter(b =>
            b.category === book?.category && b.id !== parseInt(id)
        ).slice(0, 4)
    );

    if (!book) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Không tìm thấy sách</h2>
                <Link to="/" className="btn btn-primary">Quay lại trang chủ</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            dispatch(addToCart(book));
        }
        setQuantity(1);
    };

    const discountPercent = book.originalPrice
        ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
        : 0;

    return (
        <div className="book-detail-page">
            {/* Breadcrumb */}
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <span>{book.category}</span>
                    <span>/</span>
                    <span>{book.title}</span>
                </div>
            </div>

            {/* Book Detail Section */}
            <section className="book-detail-section">
                <div className="container">
                    <div className="book-detail-grid">
                        {/* Book Image */}
                        <div className="book-detail-image-wrapper">
                            {discountPercent > 0 && (
                                <div className="discount-badge">-{discountPercent}%</div>
                            )}
                            <img src={book.image} alt={book.title} className="book-detail-image" />
                        </div>

                        {/* Book Info */}
                        <div className="book-detail-info">
                            <span className="book-category-badge">{book.category}</span>
                            <h1 className="book-detail-title">{book.title}</h1>
                            <p className="book-detail-author">Tác giả: <strong>{book.author}</strong></p>

                            <div className="book-rating-section">
                                <span className="rating-stars">⭐ {book.rating}</span>
                                <span className="rating-reviews">({book.reviews} đánh giá)</span>
                            </div>

                            <div className="book-price-section">
                                <div className="price-group">
                                    <span className="current-price-large">{book.price.toLocaleString('vi-VN')}₫</span>
                                    {book.originalPrice && (
                                        <span className="original-price-large">{book.originalPrice.toLocaleString('vi-VN')}₫</span>
                                    )}
                                </div>
                                {discountPercent > 0 && (
                                    <span className="save-amount">Tiết kiệm {(book.originalPrice - book.price).toLocaleString('vi-VN')}₫</span>
                                )}
                            </div>

                            <div className="book-description">
                                <h3>Mô tả sách</h3>
                                <p>{book.description}</p>
                            </div>

                            <div className="book-meta">
                                <div className="meta-item">
                                    <span className="meta-label">ISBN:</span>
                                    <span className="meta-value">{book.isbn}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Tình trạng:</span>
                                    <span className={`meta-value ${book.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                        {book.inStock ? '✓ Còn hàng' : '✗ Hết hàng'}
                                    </span>
                                </div>
                            </div>

                            {book.inStock && (
                                <div className="purchase-controls">
                                    <div className="quantity-selector">
                                        <label>Số lượng:</label>
                                        <div className="quantity-input-group">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                min="1"
                                            />
                                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                        </div>
                                    </div>

                                    <button onClick={handleAddToCart} className="btn btn-primary btn-large">
                                        🛒 Thêm vào giỏ hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Books Section */}
            {relatedBooks.length > 0 && (
                <section className="related-books-section">
                    <div className="container">
                        <h2>Sách Liên Quan</h2>
                        <div className="related-books-grid">
                            {relatedBooks.map((relatedBook) => (
                                <BookCard key={relatedBook.id} book={relatedBook} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default BookDetail;
