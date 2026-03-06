import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllOrders } from '../../redux/ordersSlice';
import './Dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();
    const allBooks = useSelector(state => state.books.allBooks);
    const { allOrders, loading } = useSelector(state => state.orders);

    useEffect(() => {
        dispatch(fetchAllOrders());
    }, [dispatch]);

    // Calculate real statistics from orders
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const totalRevenue = allOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // recent orders sorted by date
    const recentOrders = [...allOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const stats = [
        { icon: '📚', label: 'Tổng Sách', value: allBooks.length, color: '#6366f1' },
        { icon: '📦', label: 'Đơn Hàng', value: totalOrders, color: '#10b981' },
        { icon: '💰', label: 'Doanh Thu', value: `${(totalRevenue / 1000000).toFixed(1)}M`, color: '#f59e0b' },
        { icon: '⏳', label: 'Chờ Xử Lý', value: pendingOrders, color: '#ec4899' },
    ];

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

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
                    <h3>📦 Đơn Hàng Gần Đây</h3>
                    <div className="activity-list">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order._id} className="activity-item">
                                    <span className="activity-icon">🛒</span>
                                    <div className="activity-content">
                                        <p>Đơn hàng #{order.orderNumber}</p>
                                        <span className="activity-time">
                                            {order.shippingAddress?.fullName} - {order.totalPrice.toLocaleString()}₫
                                        </span>
                                    </div>
                                    <span className={`status-badge status-${order.status}`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">Chưa có đơn hàng nào</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>🔥 Sách Bán Chạy</h3>
                    <div className="top-books-list">
                        {allBooks.slice(0, 5).map((book) => (
                            <div key={book._id || book.id} className="top-book-item">
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
