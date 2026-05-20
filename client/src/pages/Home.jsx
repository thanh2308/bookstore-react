import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  setSearchQuery,
  setCategory,
  setSortBy,
  setPage,
  fetchBooks,
} from "../redux/booksSlice";
import BookCard, { BookCardSkeleton } from "../components/BookCard";
import Pagination from "../components/Pagination";
import AppIcon from "../components/AppIcon";
import "./Home.css";

const categories = [
  { name: "Văn học", apiName: "Văn học Việt Nam", icon: "book" },
  { name: "Kinh doanh", apiName: "Kinh tế", icon: "chart" },
  { name: "Khoa học", apiName: "Khoa học", icon: "sparkles" },
  { name: "Thiếu nhi", apiName: "Thiếu nhi", icon: "gift" },
  { name: "Tâm lý", apiName: "Kỹ năng sống", icon: "heart" },
];

const Home = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const {
    filteredBooks,
    searchQuery,
    selectedCategory,
    sortBy,
    loading,
    error,
    currentPage,
    totalPages,
    total,
  } = useSelector((state) => state.books);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const activePromotion = useSelector((state) =>
    state.promotions.promotions?.find((promotion) => promotion.isActive),
  );

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchInput(query);
    dispatch(setSearchQuery(query));
  }, [dispatch, searchParams]);

  // Fetch books on mount and when filters change
  useEffect(() => {
    const filters = {
      category: selectedCategory,
      search: searchQuery,
      sortBy: sortBy,
      page: currentPage,
      limit: 20,
    };
    dispatch(fetchBooks(filters));
  }, [dispatch, selectedCategory, searchQuery, sortBy, currentPage]);

  const handleSearch = (value) => {
    dispatch(setSearchQuery(value));
  };

  const handleCategoryChange = (category) => {
    dispatch(setCategory(category));
  };

  const handleSortChange = (value) => {
    dispatch(setSortBy(value));
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
            <div className="hero-copy">
              <span className="hero-kicker">Nhà sách tuyển chọn</span>
              <h1 className="hero-title">BookStore dành cho những buổi đọc chậm.</h1>
              <p className="hero-subtitle">
                Tủ sách cao cấp, ấm áp và được chọn lọc cho độc giả muốn tìm đúng cuốn sách tiếp theo.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#featured-books">Khám phá ngay</a>
                <a className="btn btn-secondary" href="#featured-books">Xem bestseller</a>
              </div>
            </div>

            <div className="hero-book" aria-hidden="true">
              <div className="hero-book-cover">
                <span>BookStore</span>
                <strong>The Quiet Shelf</strong>
                <em>Selected essays</em>
              </div>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm sách theo tên hoặc tác giả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              <span className="search-icon"><AppIcon name="search" size={22} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-section">
        <div className="container">
          <div className="section-heading">
            <span>Danh mục nổi bật</span>
            <h2>Chọn kệ sách hợp với hôm nay</h2>
          </div>
          <div className="category-tabs">
            <button
              onClick={() => handleCategoryChange("Tất cả")}
              className={`category-tab ${selectedCategory === "Tất cả" ? "active" : ""}`}
            >
              <AppIcon name="book" size={18} />
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.apiName)}
                className={`category-tab ${selectedCategory === category.apiName ? "active" : ""}`}
              >
                <AppIcon name={category.icon} size={18} />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activePromotion && (
        <section className="promotion-strip">
          <div className="container promotion-strip-inner">
            <span><AppIcon name="gift" size={18} /> {activePromotion.name}</span>
            <strong>Giảm {Math.round((activePromotion.discountRate || 0) * 100)}%</strong>
          </div>
        </section>
      )}

      {/* Books Grid */}
      <section className="books-section" id="featured-books">
        <div className="container">
          <div className="books-header-row">
            <div>
              <span className="section-eyebrow">Nổi bật tuần này</span>
              <h2>Những tựa sách đang được quan tâm ({filteredBooks.length})</h2>
            </div>

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
            <div className="books-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <BookCardSkeleton key={n} />
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              <p><AppIcon name="alert" size={18} /> {error}</p>
              <button
                onClick={() => dispatch(fetchBooks({}))}
                className="btn btn-primary"
              >
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
              <p><AppIcon name="book" size={22} /> Không tìm thấy sách nào</p>
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

      <Link to="/ai" className="floating-chat-button" aria-label="Mở BookStore AI">
        <AppIcon name="bot" size={22} />
      </Link>
    </div>
  );
};

export default Home;
