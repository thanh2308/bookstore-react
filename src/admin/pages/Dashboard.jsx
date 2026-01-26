import React from 'react';
import { useSelector } from 'react-redux';
import './Dashboard.css';

const Dashboard = () => {
    const allBooks = useSelector(state => state.books.allBooks);
    const cartItems = useSelector(state => state.cart.items);
    const wishlistCount = useSelector(state => state.wishlist.items.length);

    // Mock stats - trong thực tế sẽ tính từ orders
    const stats = [
        { icon: '📚', label: 'Tổng Sách', value: allBooks.length, color: '#6366f1' },
        { icon: '📦', label: 'Đơn Hàng', value: 12, color: '#10b981' },
        { icon: '💰', label: 'Doanh Thu', value: '15.5M', color: '#f59e0b' },
        { icon: '👥', label: 'Khách Hàng', value: 48, color: '#ec4899' },
    ];

    return (
        <div className="dashboard-page">
            <h1>Dashboard - Tổng Quan</h1>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">{stat.label}</p>
                            <h2 className="stat-value" style={{ color: stat.color }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>📈 Hoạt Động Gần Đây</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-icon">🛒</span>
                            <div className="activity-content">
                                <p>Đơn hàng mới #1234</p>
                                <span className="activity-time">5 phút trước</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <span className="activity-icon">📚</span>
                            <div className="activity-content">
                                <p>Sách "Atomic Habits" sắp hết</p>
                                <span className="activity-time">1 giờ trước</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <span className="activity-icon">👤</span>
                            <div className="activity-content">
                                <p>Khách hàng mới đăng ký</p>
                                <span className="activity-time">2 giờ trước</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>🔥 Sách Bán Chạy</h3>
                    <div className="top-books-list">
                        {allBooks.slice(0, 5).map((book) => (
                            <div key={book.id} className="top-book-item">
                                <img src={book.image} alt={book.title} />
                                <div className="top-book-info">
                                    <p className="top-book-title">{book.title}</p>
                                    <span className="top-book-author">{book.author}</span>
                                </div>
                                <span className="top-book-price">{book.price.toLocaleString()}₫</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
