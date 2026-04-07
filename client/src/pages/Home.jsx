import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    setSearchQuery,
    setCategory,
    setSortBy,
    setPage,
    fetchBooks
} from '../redux/booksSlice';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import './Home.css';

const categories = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Kinh tế', 'Văn học Việt Nam', 'Thiếu nhi'];

const Home = () => {
    const dispatch = useDispatch();
    const {
        filteredBooks,
        searchQuery,
        selectedCategory,
        sortBy,
        loading,
        error,
        currentPage,
        totalPages,
        total
    } = useSelector(state => state.books);

    const [searchInput, setSearchInput] = useState(searchQuery);
    // Fetch books on mount and when filters change
    useEffect(() => {
        const filters = {
            category: selectedCategory,
            search: searchQuery,
            sortBy: sortBy,
            page: currentPage,
            limit: 20
        };
        dispatch(fetchBooks(filters));
    }, [dispatch, selectedCategory, searchQuery, sortBy, currentPage]);

    const handleSearch = (value) => {
        dispatch(setSearchQuery(value));
    };

    const handleCategoryChange = (category) => {
        dispatch(setCategory(category));
    };

    const handlePageChange = (page) => {
        dispatch(setPage(page));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setSearchQuery(searchInput));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput, dispatch]);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">📚 Chào Mừng Đến BookStore</h1>
                        <p className="hero-subtitle">Khám phá thế giới tri thức cùng hàng ngàn đầu sách chất lượng</p>

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách theo tên hoặc tác giả..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <section className="category-section">
                <div className="container">
                    <div className="category-tabs">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Books Grid */}
            <section className="books-section">
                <div className="container">
                    <div className="books-header-row">
                        <h2>Danh Sách Sách ({filteredBooks.length})</h2>

                        <div className="sort-controls">
                            <label>Sắp xếp:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="sort-select"
                            >
                                <option value="default">Mặc định</option>
                                <option value="price-asc">Giá: Thấp → Cao</option>
                                <option value="price-desc">Giá: Cao → Thấp</option>
                                <option value="rating">Đánh giá cao nhất</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải sách...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>❌ {error}</p>
                            <button onClick={() => dispatch(fetchBooks({}))} className="btn btn-primary">
                                Thử lại
                            </button>
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        <div className="books-grid">
                            {filteredBooks.map((book) => (
                                <BookCard key={book._id || book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-books">
                            <p>📚 Không tìm thấy sách nào</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={total}
                            itemsPerPage={20}
                        />
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;

