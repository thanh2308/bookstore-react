import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders } from '../redux/ordersSlice';
import './MyOrders.css';

const MyOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myOrders, loading, error } = useSelector(state => state.orders);
    const { isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        dispatch(fetchMyOrders());
    }, [dispatch, isAuthenticated, navigate]);

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            pending: 'badge-warning',
            confirmed: 'badge-info',
            processing: 'badge-primary',
            shipping: 'badge-primary',
            delivered: 'badge-success',
            cancelled: 'badge-danger',
            returned: 'badge-danger'
        };
        return statusClasses[status] || 'badge-secondary';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            processing: 'Đang xử lý',
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
            returned: 'Đã trả hàng'
        };
        return statusTexts[status] || status;
    };

    const handleViewOrder = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={() => dispatch(fetchMyOrders())} className="btn btn-primary">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="container">
                <h1>Đơn Hàng Của Tôi</h1>

                {myOrders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <h2>Chưa có đơn hàng nào</h2>
                        <p>Bạn chưa đặt đơn hàng nào. Hãy khám phá và mua sắm ngay!</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Mua sắm ngay
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {myOrders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>Đơn hàng #{order.orderNumber}</h3>
                                        <p className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img
                                                src={item.image || '/placeholder-book.jpg'}
                                                alt={item.title}
                                                className="item-image"
                                            />
                                            <div className="item-details">
                                                <h4>{item.title}</h4>
                                                <p>Số lượng: {item.quantity}</p>
                                            </div>
                                            <div className="item-price">
                                                {item.price.toLocaleString('vi-VN')}₫
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <strong>Tổng cộng:</strong>
                                        <span className="total-price">
                                            {order.totalPrice.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleViewOrder(order._id)}
                                        className="btn btn-outline"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
