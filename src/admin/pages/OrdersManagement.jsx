import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateOrderStatus } from '../../redux/ordersSlice';
import { useToast } from '../../components/Toast';
import './OrdersManagement.css';

const OrdersManagement = () => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const orders = useSelector(state => state.orders.orders);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const handleStatusUpdate = (orderId, newStatus) => {
        dispatch(updateOrderStatus({ orderId, status: newStatus }));
        success(`Đã cập nhật trạng thái đơn hàng!`);
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'status-pending',
            processing: 'status-processing',
            shipped: 'status-shipped',
            delivered: 'status-delivered'
        };
        return classes[status] || '';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao'
        };
        return texts[status] || status;
    };

    return (
        <div className="orders-management">
            <h1>📦 Quản Lý Đơn Hàng</h1>

            <div className="orders-filters">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                >
                    Tất cả ({orders.length})
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                >
                    Chờ xử lý
                </button>
                <button
                    onClick={() => setFilterStatus('processing')}
                    className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
                >
                    Đang xử lý
                </button>
                <button
                    onClick={() => setFilterStatus('shipped')}
                    className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
                >
                    Đang giao
                </button>
                <button
                    onClick={() => setFilterStatus('delivered')}
                    className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                >
                    Đã giao
                </button>
            </div>

            <div className="orders-list">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="order-card">
                        <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                            <div className="order-info">
                                <h3>Đơn hàng #{order.id}</h3>
                                <p className="order-customer">👤 {order.customer.name} - {order.customer.email}</p>
                                <p className="order-date">📅 {order.date}</p>
                            </div>
                            <div className="order-summary">
                                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                                <p className="order-total">{order.total.toLocaleString()}₫</p>
                                <button className="expand-btn">
                                    {expandedOrder === order.id ? '▲' : '▼'}
                                </button>
                            </div>
                        </div>

                        {expandedOrder === order.id && (
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
                                    <p>{order.address}</p>
                                </div>

                                <div className="order-actions">
                                    <label>Cập nhật trạng thái:</label>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="processing">Đang xử lý</option>
                                        <option value="shipped">Đang giao</option>
                                        <option value="delivered">Đã giao</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersManagement;
