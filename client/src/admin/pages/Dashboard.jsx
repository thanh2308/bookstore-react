import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchBooks } from '../../redux/booksSlice';
import { fetchAllOrders } from '../../redux/ordersSlice';
import analyticsService from '../../services/analyticsService';
import { getOptimizedImageUrl } from '../../services/api';
import AppIcon from '../../components/AppIcon';
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

    const statusData = ['pending', 'processing', 'shipping', 'delivered', 'cancelled']
        .map((status) => ({
            name: status,
            value: allOrders.filter((order) => order.status === status).length,
        }))
        .filter((item) => item.value > 0);

    const lowStockBooks = allBooks.filter((book) => Number(book.stockQuantity || 0) < 5);

    const stats = [
        { icon: 'wallet', label: 'Tổng doanh thu', value: `${((summary?.totalRevenue || 0) / 1000000).toFixed(1)}M`, trend: '+8.4%', tone: 'amber' },
        { icon: 'package', label: 'Đơn hàng mới', value: summary?.totalOrders ?? allOrders.length, trend: '+4.1%', tone: 'green' },
        { icon: 'book', label: 'Sách bán chạy', value: summary?.topBooks?.[0]?.title || allBooks[0]?.title || 'Chưa có', trend: 'Top 1', tone: 'stone' },
        { icon: 'users', label: 'User mới', value: summary?.totalUsers ?? 0, trend: '+2.2%', tone: 'blue' },
    ];

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-skeleton" aria-label="Đang tải dashboard">
                    {[1, 2, 3, 4].map((item) => <span className="skeleton dashboard-skeleton-card" key={item} />)}
                    <span className="skeleton dashboard-skeleton-chart" />
                </div>
            </div>
        );
    }

    return (
            <div className="dashboard-page">
            <h1>Dashboard - Tổng Quan</h1>

            {lowStockBooks.length > 0 && (
                <div className="low-stock-alert" role="alert">
                    <AppIcon name="alert" size={18} />
                    <span>{lowStockBooks.length} sách đang dưới ngưỡng 5 cuốn trong kho.</span>
                </div>
            )}

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card stat-card-${stat.tone}`}>
                        <div className="stat-icon">
                            <AppIcon name={stat.icon} size={22} />
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">{stat.label}</p>
                            <h2 className="stat-value">{stat.value}</h2>
                            <span className="stat-trend">{stat.trend} so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-chart-row">
                <div className="dashboard-card">
                    <h3><AppIcon name="chart" size={20} /> Doanh thu 30 ngày</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₫`} />
                            <Line type="monotone" dataKey="revenue" stroke="#B45309" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="dashboard-card">
                    <h3><AppIcon name="package" size={20} /> Trạng thái đơn</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                                {statusData.map((entry, index) => (
                                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3><AppIcon name="package" size={20} /> Đơn Hàng Gần Đây</h3>
                    <div className="activity-list">
                        {(summary?.recentOrders || []).length > 0 ? (
                            summary.recentOrders.map((order) => (
                                <div key={order._id} className="activity-item">
                                    <span className="activity-icon"><AppIcon name="cart" size={18} /></span>
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
                    <h3><AppIcon name="star" size={20} /> Sách Bán Chạy</h3>
                    <div className="top-books-list">
                        {(summary?.topBooks || allBooks.slice(0, 5)).slice(0, 5).map((book) => (
                            <div key={book._id || book.id} className="top-book-item">
                                <img src={getOptimizedImageUrl(book.coverImage || book.image, "w_180,f_auto,q_auto")} alt={book.title} />
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

const CHART_COLORS = ['#B45309', '#1C1917', '#047857', '#2563eb', '#B91C1C'];

export default Dashboard;
