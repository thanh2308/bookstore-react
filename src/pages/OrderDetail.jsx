import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../redux/ordersSlice';
import { useToast } from '../components/Toast';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { success } = useToast();

    const { currentOrder: order, loading, error } = useSelector(state => state.orders);
    const { isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        dispatch(fetchOrderById(id));
    }, [id, dispatch, isAuthenticated, navigate]);

    const handleCancelOrder = async () => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

        const result = await dispatch(cancelOrder({
            id,
            reason: 'Khách hàng yêu cầu hủy'
        }));

        if (cancelOrder.fulfilled.match(result)) {
            success('Đơn hàng đã được hủy');
        }
    };

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

    if (loading) {
        return (
            <div className="container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container">
                <div className="error-state">
                    <p>❌ {error || 'Không tìm thấy đơn hàng'}</p>
                    <button onClick={() => navigate('/my-orders')} className="btn btn-primary">
                        Về danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    const canCancel = order.status === 'pending' || order.status === 'confirmed';

    return (
        <div className="order-detail-page">
            <div className="container">
                <div className="order-header">
                    <div className="order-title-section">
                        <button onClick={() => navigate('/my-orders')} className="back-btn">
                            ← Quay lại
                        </button>
                        <h1>Đơn hàng #{order.orderNumber}</h1>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>
                    <div className="order-date">
                        Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                <div className="order-content">
                    {/* Tracking Timeline */}
                    <div className="order-section">
                        <h2>Trạng thái đơn hàng</h2>
                        <div className="status-timeline">
                            {order.statusHistory?.map((item, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-status">{getStatusText(item.status)}</div>
                                        <div className="timeline-date">
                                            {new Date(item.date).toLocaleString('vi-VN')}
                                        </div>
                                        {item.note && <div className="timeline-note">{item.note}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-section">
                        <h2>Sản phẩm</h2>
                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item-detail">
                                    <img src={item.image || '/placeholder-book.jpg'} alt={item.title} />
                                    <div className="item-info">
                                        <h3>{item.title}</h3>
                                        <p className="item-meta">Số lượng: {item.quantity}</p>
                                        <p className="item-price">{item.price.toLocaleString('vi-VN')}₫</p>
                                    </div>
                                    <div className="item-total">
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="order-section">
                        <h2>Địa chỉ giao hàng</h2>
                        <div className="address-box">
                            <p><strong>{order.shippingAddress.fullName}</strong></p>
                            <p>{order.shippingAddress.phone}</p>
                            <p>{order.shippingAddress.email}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}</p>
                        </div>
                    </div>

                    {/* Payment & Total */}
                    <div className="order-section">
                        <h2>Thanh toán</h2>
                        <div className="payment-summary">
                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{order.itemsPrice?.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển:</span>
                                <span>{order.shippingPrice?.toLocaleString('vi-VN')}₫</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Giảm giá:</span>
                                    <span>-{order.discount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <strong>Tổng cộng:</strong>
                                <strong className="total-price">
                                    {order.totalPrice.toLocaleString('vi-VN')}₫
                                </strong>
                            </div>
                            <div className="payment-method-info">
                                <p>Phương thức: <strong>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</strong></p>
                                <p>Trạng thái thanh toán: <span className={order.isPaid ? 'paid' : 'unpaid'}>
                                    {order.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                                </span></p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {canCancel && (
                        <div className="order-actions">
                            <button onClick={handleCancelOrder} className="btn btn-danger">
                                Hủy đơn hàng
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
