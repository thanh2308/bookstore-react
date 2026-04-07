import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/ordersSlice';
import { useToast } from '../../components/Toast';
import './OrdersManagement.css';

const OrdersManagement = () => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const { allOrders, loading } = useSelector(state => state.orders);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        dispatch(fetchAllOrders());
    }, [dispatch]);

    const filteredOrders = filterStatus === 'all'
        ? allOrders
        : allOrders.filter(o => o.status === filterStatus);

    const handleStatusUpdate = async (orderId, newStatus) => {
        const result = await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
        if (updateOrderStatus.fulfilled.match(result)) {
            success(`Đã cập nhật trạng thái đơn hàng!`);
        }
    };

    const exportCsv = () => {
        const rows = [
            ['orderNumber', 'customer', 'status', 'totalPrice', 'createdAt'],
            ...filteredOrders.map(order => [
                order.orderNumber,
                order.customer?.name || order.shippingAddress?.fullName || '',
                order.status,
                order.totalPrice,
                order.createdAt
            ])
        ];

        const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'orders.csv';
        link.click();
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            processing: 'status-processing',
            shipping: 'status-shipping',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled'
        };
        return classes[status] || '';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xử lý',
            confirmed: 'Đã xác nhận',
            processing: 'Đang xử lý',
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="orders-management">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-management">
            <h1>📦 Quản Lý Đơn Hàng</h1>

            <div className="orders-filters">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                >
                    Tất cả ({allOrders.length})
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                >
                    Chờ xử lý ({allOrders.filter(o => o.status === 'pending').length})
                </button>
                <button
                    onClick={() => setFilterStatus('confirmed')}
                    className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                >
                    Đã xác nhận ({allOrders.filter(o => o.status === 'confirmed').length})
                </button>
                <button
                    onClick={() => setFilterStatus('shipping')}
                    className={`filter-btn ${filterStatus === 'shipping' ? 'active' : ''}`}
                >
                    Đang giao ({allOrders.filter(o => o.status === 'shipping').length})
                </button>
                <button
                    onClick={() => setFilterStatus('delivered')}
                    className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                >
                    Đã giao ({allOrders.filter(o => o.status === 'delivered').length})
                </button>
                <button onClick={exportCsv} className="filter-btn">
                    Export CSV
                </button>
            </div>

            <div className="orders-list">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                                <div className="order-info">
                                    <h3>Đơn hàng #{order.orderNumber}</h3>
                                    <p className="order-customer">
                                        👤 {order.shippingAddress?.fullName} - {order.shippingAddress?.email}
                                    </p>
                                    <p className="order-date">
                                        📅 {new Date(order.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div className="order-summary">
                                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                    <p className="order-total">{order.totalPrice.toLocaleString()}₫</p>
                                    <button className="expand-btn">
                                        {expandedOrder === order._id ? '▲' : '▼'}
                                    </button>
                                </div>
                            </div>

                            {expandedOrder === order._id && (
                                <div className="order-details">
                                    <div className="order-items">
                                        <h4>Sản phẩm:</h4>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <span>{item.title}</span>
                                                <span>x{item.quantity}</span>
                                                <span>{(item.price * item.quantity).toLocaleString()}₫</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-address">
                                        <h4>Địa chỉ giao hàng:</h4>
                                        <p>{order.shippingAddress?.address}</p>
                                        <p>{order.shippingAddress?.city}</p>
                                        <p>SĐT: {order.shippingAddress?.phone}</p>
                                    </div>

                                    <div className="order-actions">
                                        <label>Cập nhật trạng thái:</label>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="confirmed">Đã xác nhận</option>
                                            <option value="processing">Đang xử lý</option>
                                            <option value="shipping">Đang giao</option>
                                            <option value="delivered">Đã giao</option>
                                            <option value="cancelled">Đã hủy</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-data">Không có đơn hàng nào</p>
                )}
            </div>
        </div>
    );
};

export default OrdersManagement;
