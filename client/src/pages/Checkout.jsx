import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, clearError } from '../redux/ordersSlice';
import { clearCart } from '../redux/cartSlice';
import { useToast } from '../components/Toast';
import './Checkout.css';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { success, error: showToastError } = useToast();

    const { items: cart, totalAmount: totalPrice } = useSelector(state => state.cart || { items: [], totalAmount: 0 });
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const { loading, error } = useSelector(state => state.orders);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [submitted, setSubmitted] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            showToastError('Vui lòng đăng nhập để thanh toán');
            navigate('/login');
        }
    }, [isAuthenticated, navigate, showToastError]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0 && !submitted) {
            navigate('/cart');
        }
    }, [cart, submitted, navigate]);

    // Show error toast if order creation fails
    useEffect(() => {
        if (error) {
            showToastError(error);
            dispatch(clearError());
        }
    }, [error, showToastError, dispatch]);

    const handleChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create order object matching backend schema
        const orderData = {
            customer: {
                name: shippingInfo.fullName,
                email: shippingInfo.email,
                phone: shippingInfo.phone
            },
            items: cart.map(item => ({
                book: item._id || item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            shippingAddress: {
                address: shippingInfo.address,
                city: shippingInfo.city
            },
            paymentMethod: paymentMethod,
            itemsPrice: totalPrice,
            shippingPrice: 0,
            totalPrice: totalPrice,
            notes: shippingInfo.notes || ''
        };

        try {
            // Dispatch create order action
            const result = await dispatch(createOrder(orderData)).unwrap();

            // Clear cart on success
            dispatch(clearCart());
            setSubmitted(true);

            success('Đặt hàng thành công!');

            // Navigate to success page after delay
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (err) {
            console.error('Order creation failed:', err);
            showToastError(err.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
        }
    };

    // Success screen
    if (submitted) {
        return (
            <div className="checkout-success-page">
                <div className="container">
                    <div className="success-content">
                        <div className="success-icon">✓</div>
                        <h1>Đặt hàng thành công!</h1>
                        <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                        <div className="success-details">
                            <h3>Thông tin đơn hàng</h3>
                            <p><strong>Họ tên:</strong> {shippingInfo.fullName}</p>
                            <p><strong>Email:</strong> {shippingInfo.email}</p>
                            <p><strong>Số điện thoại:</strong> {shippingInfo.phone}</p>
                            <p><strong>Địa chỉ:</strong> {shippingInfo.address}, {shippingInfo.city}</p>
                            <p><strong>Tổng tiền:</strong> <span className="success-total">{totalPrice.toLocaleString('vi-VN')}₫</span></p>
                        </div>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading or empty cart check
    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="checkout-title">Thanh Toán</h1>

                <div className="checkout-layout">
                    {/* Checkout Form */}
                    <div className="checkout-form-section">
                        <h2>Thông tin giao hàng</h2>
                        <form onSubmit={handleSubmit} className="checkout-form">
                            <div className="form-group">
                                <label htmlFor="fullName">Họ và tên *</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={shippingInfo.fullName}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="Nguyễn Văn A"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={shippingInfo.email}
                                        onChange={handleChange}
                                        required
                                        className="input"
                                        placeholder="email@example.com"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleChange}
                                        required
                                        className="input"
                                        placeholder="0123456789"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Địa chỉ *</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={shippingInfo.address}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="Số nhà, tên đường"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">Thành phố *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={shippingInfo.city}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    disabled={loading}
                                >
                                    <option value="">Chọn thành phố</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Hải Phòng">Hải Phòng</option>
                                    <option value="Cần Thơ">Cần Thơ</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentMethod">Phương thức thanh toán *</label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    required
                                    className="input"
                                    disabled={loading}
                                >
                                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                                    <option value="Banking">Chuyển khoản ngân hàng</option>
                                    <option value="VNPay">VNPay</option>
                                    <option value="MoMo">MoMo</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Ghi chú (không bắt buộc)</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={shippingInfo.notes}
                                    onChange={handleChange}
                                    className="input"
                                    rows="4"
                                    placeholder="Ghi chú về đơn hàng..."
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3>Đơn hàng của bạn</h3>

                        <div className="order-items">
                            {cart.map((item) => (
                                <div key={item._id || item.id} className="order-item">
                                    <img src={item.image} alt={item.title} />
                                    <div className="order-item-info">
                                        <p className="order-item-title">{item.title}</p>
                                        <p className="order-item-quantity">Số lượng: {item.quantity}</p>
                                    </div>
                                    <p className="order-item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                                </div>
                            ))}
                        </div>

                        <div className="order-total-section">
                            <div className="order-row">
                                <span>Tạm tính:</span>
                                <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="order-row">
                                <span>Phí vận chuyển:</span>
                                <span className="free-text">Miễn phí</span>
                            </div>
                            <div className="order-divider"></div>
                            <div className="order-row total">
                                <span>Tổng cộng:</span>
                                <span className="total-price">{totalPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
