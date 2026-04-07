import Book from '../models/Book.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const getRevenueTotal = (orders) => orders.reduce((sum, order) => {
    if (order.status === 'cancelled') {
        return sum;
    }

    return sum + (order.totalPrice || 0);
}, 0);

export const getAnalyticsSummary = async (req, res) => {
    try {
        const [booksCount, usersCount, orders, recentOrders, topBooksAgg] = await Promise.all([
            Book.countDocuments(),
            User.countDocuments(),
            Order.find({}).select('totalPrice status createdAt orderNumber customer shippingAddress').sort('-createdAt').limit(5).populate('user', 'name email'),
            Order.find({}).select('totalPrice status createdAt orderNumber customer shippingAddress').sort('-createdAt'),
            Order.aggregate([
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.book',
                        title: { $first: '$items.title' },
                        quantity: { $sum: '$items.quantity' },
                        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                    }
                },
                { $sort: { quantity: -1 } },
                { $limit: 10 }
            ])
        ]);

        const topBooks = await Promise.all(topBooksAgg.map(async (item) => {
            const book = await Book.findById(item._id).select('title author image price category rating');
            return {
                _id: item._id,
                title: book?.title || item.title || 'Không rõ',
                author: book?.author || '',
                image: book?.image || '',
                price: book?.price || 0,
                category: book?.category || '',
                rating: book?.rating || 0,
                quantity: item.quantity,
                revenue: item.revenue
            };
        }));

        res.status(200).json({
            success: true,
            summary: {
                totalRevenue: getRevenueTotal(orders),
                totalOrders: orders.length,
                totalBooks: booksCount,
                totalUsers: usersCount,
                pendingOrders: orders.filter(order => order.status === 'pending').length,
                recentOrders,
                topBooks: topBooks.slice(0, 5)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getRevenueAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const orders = await Order.find({ status: { $ne: 'cancelled' } }).select('totalPrice createdAt');

        const grouped = {};

        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            let key;

            if (period === 'day') {
                key = date.toISOString().slice(0, 10);
            } else if (period === 'week') {
                const weekStart = new Date(date);
                const day = weekStart.getDay();
                const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
                weekStart.setDate(diff);
                key = weekStart.toISOString().slice(0, 10);
            } else {
                key = date.toISOString().slice(0, 7);
            }

            grouped[key] = (grouped[key] || 0) + (order.totalPrice || 0);
        });

        const data = Object.entries(grouped)
            .map(([label, revenue]) => ({ label, revenue }))
            .sort((a, b) => a.label.localeCompare(b.label));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTopBooks = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 10);

        const books = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.book',
                    title: { $first: '$items.title' },
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: limit }
        ]);

        const result = await Promise.all(books.map(async (item) => {
            const book = await Book.findById(item._id).select('title author image price category rating');
            return {
                _id: item._id,
                title: book?.title || item.title || 'Không rõ',
                author: book?.author || '',
                image: book?.image || '',
                price: book?.price || 0,
                category: book?.category || '',
                rating: book?.rating || 0,
                quantity: item.quantity,
                revenue: item.revenue
            };
        }));

        res.status(200).json({ success: true, books: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
