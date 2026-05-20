import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchBooks } from '../../redux/booksSlice';
import { fetchAllOrders } from '../../redux/ordersSlice';
import analyticsService from '../../services/analyticsService';
import AppIcon from '../../components/AppIcon';
import './Analytics.css';

const Analytics = () => {
    const dispatch = useDispatch();
    const orders = useSelector(state => state.orders?.allOrders || []);
    const allBooks = useSelector(state => state.books?.allBooks || []);
    const [summary, setSummary] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topBooksData, setTopBooksData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30d');

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
                    analyticsService.getRevenue(dateRange === '7d' ? 'week' : 'month'),
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
    }, [dispatch, dateRange]);

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

    const COLORS = ['#256d5a', '#9f5f37', '#1f8a5b', '#d99a2b', '#2f6f9f', '#c2413c'];

    if (loading) {
        return (
            <div className="loading-state">
                <div className="analytics-skeleton" aria-label="Đang tải analytics">
                    {[1, 2, 3, 4].map((item) => <span className="skeleton analytics-skeleton-card" key={item} />)}
                    <span className="skeleton analytics-skeleton-chart" />
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h1><AppIcon name="analytics" size={28} /> Thống Kê & Phân Tích</h1>
                <div className="analytics-actions">
                    <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} aria-label="Chọn khoảng thời gian">
                        <option value="7d">7 ngày</option>
                        <option value="30d">30 ngày</option>
                        <option value="3m">3 tháng</option>
                    </select>
                    <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                        <AppIcon name="upload" size={16} /> Xuất báo cáo PDF
                    </button>
                </div>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon"><AppIcon name="wallet" size={22} /></div>
                    <div className="stat-info">
                        <p>Tổng Doanh Thu</p>
                        <h2>{Number(stats.totalRevenue).toLocaleString()}₫</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><AppIcon name="package" size={22} /></div>
                    <div className="stat-info">
                        <p>Tổng Đơn Hàng</p>
                        <h2>{stats.totalOrders}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><AppIcon name="chart" size={22} /></div>
                    <div className="stat-info">
                        <p>Giá Trị Trung Bình</p>
                        <h2>{Number(stats.avgOrderValue).toLocaleString()}₫</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><AppIcon name="book" size={22} /></div>
                    <div className="stat-info">
                        <p>Tổng Sản Phẩm</p>
                        <h2>{allBooks.length}</h2>
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3><AppIcon name="chart" size={20} /> Doanh Thu Theo Tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₫`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#256d5a" strokeWidth={2} name="Doanh thu" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><AppIcon name="book" size={20} /> Sách Theo Thể Loại</h3>
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
                <h3><AppIcon name="star" size={20} /> Top 5 Sách Bán Chạy</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topBooks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="quantity" fill="#256d5a" name="Số lượng" />
                        <Bar dataKey="revenue" fill="#9f5f37" name="Doanh thu (₫)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card full-width analytics-table-card">
                <h3><AppIcon name="analytics" size={20} /> Bảng Thống Kê Chi Tiết</h3>
                <div className="analytics-table-wrap">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Sách</th>
                                <th>Tác giả</th>
                                <th className="text-center">Số lượng</th>
                                <th className="text-right">Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topBooks.map((book, index) => (
                                <tr key={book._id || index}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td className="text-center">{book.quantity}</td>
                                    <td className="text-right">{Number(book.revenue || 0).toLocaleString()}₫</td>
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
