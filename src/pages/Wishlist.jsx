import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import './Wishlist.css';

const Wishlist = () => {
    const wishlistIds = useSelector(state => state.wishlist.items);
    const allBooks = useSelector(state => state.books.allBooks);

    const wishlistBooks = allBooks.filter(book => wishlistIds.includes(book.id));

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1>❤️ Danh Sách Yêu Thích</h1>
                    <p className="wishlist-subtitle">
                        {wishlistBooks.length > 0
                            ? `Bạn có ${wishlistBooks.length} cuốn sách yêu thích`
                            : 'Chưa có sách nào trong danh sách yêu thích'}
                    </p>
                </div>

                {wishlistBooks.length > 0 ? (
                    <div className="wishlist-grid">
                        {wishlistBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-wishlist">
                        <div className="empty-icon">🤍</div>
                        <h2>Danh sách yêu thích trống</h2>
                        <p>Hãy thêm những cuốn sách bạn thích bằng cách click vào icon trái tim!</p>
                        <Link to="/" className="btn btn-primary">
                            Khám phá sách ngay
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
