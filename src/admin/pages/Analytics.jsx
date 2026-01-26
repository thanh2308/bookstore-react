import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
    const orders = useSelector(state => state.orders.orders);
    const allBooks = useSelector(state => state.books.allBooks);

    // Calculate revenue by month
    const revenueByMonth = useMemo(() => {
        const monthlyData = {};

        orders.forEach(order => {
            const month = order.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += order.total;
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
            order.items.forEach(item => {
                const book = allBooks.find(b => b.id === item.bookId);
                if (book) {
                    if (!categoryData[book.category]) {
                        categoryData[book.category] = 0;
                    }
                    categoryData[book.category] += item.price * item.quantity;
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
            order.items.forEach(item => {
                if (!bookSales[item.bookId]) {
                    bookSales[item.bookId] = {
                        title: item.title,
                        quantity: 0,
                        revenue: 0
                    };
                }
                bookSales[item.bookId].quantity += item.quantity;
                bookSales[item.bookId].revenue += item.price * item.quantity;
            });
        });

        return Object.values(bookSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [orders]);

    // Total statistics
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
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
        </div>
    );
};

export default Analytics;
