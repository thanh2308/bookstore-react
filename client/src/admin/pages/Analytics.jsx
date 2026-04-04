import React, { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './Analytics.css';

const Analytics = () => {
    const orders = useSelector(state => state.orders?.allOrders || []);
    const allBooks = useSelector(state => state.books?.allBooks || []);
    const [wishlistData, setWishlistData] = useState({ popularBooks: [], totalUsers: 0 });
    const token = useSelector(state => state.auth.token);

    // Fetch wishlist analytics
    useEffect(() => {
        const fetchWishlistData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const { data } = await axios.get('/api/users/wishlists/all', config);
                setWishlistData({
                    popularBooks: data.popularBooks || [],
                    totalUsers: data.totalUsers || 0
                });
            } catch (error) {
                console.error('Error fetching wishlist data:', error);
            }
        };

        if (token) {
            fetchWishlistData();
        }
    }, [token]);

    // Calculate revenue by month
    const revenueByMonth = useMemo(() => {
        const monthlyData = {};

        orders.forEach(order => {
            if (!order.createdAt && !order.date) return;
            const dateStr = order.createdAt || order.date;
            const month = typeof dateStr === 'string' ? dateStr.substring(0, 7) : new Date(dateStr).toISOString().substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += order.total || order.totalAmount || 0;
        });

        return Object.keys(monthlyData).map(month => ({
            month,
            revenue: monthlyData[month]
        })).sort((a, b) => a.month.localeCompare(b.month));
    }, [orders]);

    // Calculate sales by category
    const salesByCategory = useMemo(() => {
        const categoryData = {};

        orders.forEach(order => {
            if (!order.items || !Array.isArray(order.items)) return;
            order.items.forEach(item => {
                const book = allBooks.find(b => (b._id || b.id) === (item.bookId || item.book));
                if (book) {
                    if (!categoryData[book.category]) {
                        categoryData[book.category] = 0;
                    }
                    categoryData[book.category] += (item.price || 0) * (item.quantity || 0);
                }
            });
        });

        return Object.keys(categoryData).map(category => ({
            name: category,
            value: categoryData[category]
        }));
    }, [orders, allBooks]);

    // Top selling books
    const topBooks = useMemo(() => {
        const bookSales = {};

        orders.forEach(order => {
            if (!order.items || !Array.isArray(order.items)) return;
            order.items.forEach(item => {
                const bookId = item.bookId || item.book;
                if (!bookSales[bookId]) {
                    bookSales[bookId] = {
                        title: item.title || 'Unknown',
                        quantity: 0,
                        revenue: 0
                    };
                }
                bookSales[bookId].quantity += item.quantity || 0;
                bookSales[bookId].revenue += (item.price || 0) * (item.quantity || 0);
            });
        });

        return Object.values(bookSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [orders]);

    // Total statistics
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return { totalRevenue, totalOrders, avgOrderValue };
    }, [orders]);

    const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    return (
        <div className="analytics-page">
            <h1>📊 Thống Kê & Phân Tích</h1>

            {/* Stats Cards */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>💰</div>
                    <div className="stat-info">
                        <p>Tổng Doanh Thu</p>
                        <h2>{stats.totalRevenue.toLocaleString()}₫</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>📦</div>
                    <div className="stat-info">
                        <p>Tổng Đơn Hàng</p>
                        <h2>{stats.totalOrders}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>🎯</div>
                    <div className="stat-info">
                        <p>Giá Trị Trung Bình</p>
                        <h2>{stats.avgOrderValue.toLocaleString()}₫</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>📚</div>
                    <div className="stat-info">
                        <p>Tổng Sản Phẩm</p>
                        <h2>{allBooks.length}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Revenue Chart */}
                <div className="chart-card">
                    <h3>📈 Doanh Thu Theo Tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString()}₫`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} name="Doanh thu" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Pie Chart */}
                <div className="chart-card">
                    <h3>🎨 Doanh Số Theo Thể Loại</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={salesByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {salesByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toLocaleString()}₫`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Books */}
            <div className="chart-card full-width">
                <h3>🏆 Top 5 Sách Bán Chạy</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topBooks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="quantity" fill="#6366f1" name="Số lượng" />
                        <Bar dataKey="revenue" fill="#ec4899" name="Doanh thu (₫)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Wishlist Analytics */}
            <div className="stats-grid" style={{ marginTop: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fce7f3' }}>❤️</div>
                    <div className="stat-info">
                        <p>Người dùng có Wishlist</p>
                        <h2>{wishlistData.totalUsers}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>⭐</div>
                    <div className="stat-info">
                        <p>Sản phẩm được yêu thích</p>
                        <h2>{wishlistData.popularBooks.length}</h2>
                    </div>
                </div>
            </div>

            {/* Most Favorited Books */}
            {wishlistData.popularBooks.length > 0 && (
                <div className="chart-card full-width" style={{ marginTop: '2rem' }}>
                    <h3>❤️ Top Sách Được Yêu Thích Nhiều Nhất</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={wishlistData.popularBooks.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="book.title" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => `${value} người`}
                                labelFormatter={(label) => `Sách: ${label}`}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#ec4899" name="Số lượt thích" />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Details Table */}
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table className="wishlist-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Sách</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Tác giả</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Lượt thích</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlistData.popularBooks.slice(0, 10).map((item, index) => (
                                    <tr key={item.book._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 'bold', color: '#6366f1' }}>#{index + 1}</span>
                                                <img
                                                    src={item.book.image}
                                                    alt={item.book.title}
                                                    style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                                <span>{item.book.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{item.book.author}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <span style={{
                                                backgroundColor: '#fce7f3',
                                                color: '#ec4899',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontWeight: 'bold'
                                            }}>
                                                ❤️ {item.count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                                            {item.book.price.toLocaleString('vi-VN')}₫
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
