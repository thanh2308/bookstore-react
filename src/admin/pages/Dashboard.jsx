import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchBooks } from '../../redux/booksSlice';
import { fetchAllOrders } from '../../redux/ordersSlice';
import analyticsService from '../../services/analyticsService';
import './Dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();
    const allBooks = useSelector(state => state.books.allBooks);
    const allOrders = useSelector(state => state.orders.allOrders);
    const [summary, setSummary] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                if (allBooks.length === 0) {
                    dispatch(fetchBooks({ page: 1, limit: 100 }));
                }
                if (allOrders.length === 0) {
                    dispatch(fetchAllOrders({ page: 1, limit: 100 }));
                }

                const [summaryResult, revenueResult] = await Promise.all([
                    analyticsService.getSummary(),
                    analyticsService.getRevenue('month')
                ]);

                setSummary(summaryResult.summary);
                setRevenueData(revenueResult.data || []);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [dispatch]);

    const stats = [
        { icon: '📚', label: 'Tổng Sách', value: summary?.totalBooks ?? allBooks.length, color: '#6366f1' },
        { icon: '👥', label: 'Tổng User', value: summary?.totalUsers ?? 0, color: '#0ea5e9' },
        { icon: '📦', label: 'Đơn Hàng', value: summary?.totalOrders ?? allOrders.length, color: '#10b981' },
        { icon: '💰', label: 'Doanh Thu', value: `${((summary?.totalRevenue || 0) / 1000000).toFixed(1)}M`, color: '#f59e0b' },
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
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">{stat.label}</p>
                            <h2 className="stat-value" style={{ color: stat.color }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
                <h3>📈 Doanh Thu Theo Tháng</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₫`} />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>📦 Đơn Hàng Gần Đây</h3>
                    <div className="activity-list">
                        {(summary?.recentOrders || []).length > 0 ? (
                            summary.recentOrders.map((order) => (
                                <div key={order._id} className="activity-item">
                                    <span className="activity-icon">🛒</span>
                                    <div className="activity-content">
                                        <p>Đơn hàng #{order.orderNumber}</p>
                                        <span className="activity-time">
                                            {order.customer?.name || order.shippingAddress?.fullName || 'Khách'} - {Number(order.totalPrice || 0).toLocaleString()}₫
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
                        {(summary?.topBooks || allBooks.slice(0, 5)).slice(0, 5).map((book) => (
                            <div key={book._id || book.id} className="top-book-item">
                                <img src={book.image} alt={book.title} />
                                <div className="top-book-info">
                                    <p className="top-book-title">{book.title}</p>
                                    <span className="top-book-author">{book.author}</span>
                                </div>
                                <span className="top-book-price">{Number(book.price || 0).toLocaleString()}₫</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
