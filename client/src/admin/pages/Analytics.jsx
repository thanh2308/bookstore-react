import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchBooks } from '../../redux/booksSlice';
import { fetchAllOrders } from '../../redux/ordersSlice';
import analyticsService from '../../services/analyticsService';
import './Analytics.css';

const Analytics = () => {
    const dispatch = useDispatch();
    const orders = useSelector(state => state.orders?.allOrders || []);
    const allBooks = useSelector(state => state.books?.allBooks || []);
    const [summary, setSummary] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topBooksData, setTopBooksData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            setLoading(true);
            try {
                if (allBooks.length === 0) {
                    dispatch(fetchBooks({ page: 1, limit: 100 }));
                }
                if (orders.length === 0) {
                    dispatch(fetchAllOrders({ page: 1, limit: 100 }));
                }

                const [summaryResult, revenueResult, topBooksResult] = await Promise.all([
                    analyticsService.getSummary(),
                    analyticsService.getRevenue('month'),
                    analyticsService.getTopBooks(10)
                ]);

                setSummary(summaryResult.summary);
                setRevenueData(revenueResult.data || []);
                setTopBooksData(topBooksResult.books || []);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, [dispatch]);

    const revenueByMonth = useMemo(() => {
        return revenueData.map(item => ({ month: item.label, revenue: item.revenue }));
    }, [revenueData]);

    const salesByCategory = useMemo(() => {
        const categoryData = {};

        allBooks.forEach(book => {
            if (!book.category) return;
            categoryData[book.category] = (categoryData[book.category] || 0) + Number(book.price || 0);
        });

        return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    }, [allBooks]);

    const topBooks = useMemo(() => topBooksData.slice(0, 5), [topBooksData]);

    const stats = useMemo(() => {
        const totalRevenue = summary?.totalRevenue || 0;
        const totalOrders = summary?.totalOrders || orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return { totalRevenue, totalOrders, avgOrderValue };
    }, [orders.length, summary]);

    const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải analytics...</p>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <h1>📊 Thống Kê & Phân Tích</h1>

            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>💰</div>
                    <div className="stat-info">
                        <p>Tổng Doanh Thu</p>
                        <h2>{Number(stats.totalRevenue).toLocaleString()}₫</h2>
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
                        <h2>{Number(stats.avgOrderValue).toLocaleString()}₫</h2>
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

            <div className="charts-row">
                <div className="chart-card">
                    <h3>📈 Doanh Thu Theo Tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₫`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} name="Doanh thu" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>🎨 Sách Theo Thể Loại</h3>
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
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₫`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card full-width">
                <h3>🏆 Top 5 Sách Bán Chạy</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topBooks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="quantity" fill="#6366f1" name="Số lượng" />
                        <Bar dataKey="revenue" fill="#ec4899" name="Doanh thu (₫)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card full-width" style={{ marginTop: '2rem' }}>
                <h3>📋 Bảng Thống Kê Chi Tiết</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="wishlist-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Sách</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Tác giả</th>
                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Số lượng</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topBooks.map((book, index) => (
                                <tr key={book._id || index}>
                                    <td style={{ padding: '0.75rem' }}>{book.title}</td>
                                    <td style={{ padding: '0.75rem' }}>{book.author}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{book.quantity}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{Number(book.revenue || 0).toLocaleString()}₫</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
