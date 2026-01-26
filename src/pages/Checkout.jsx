import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/cartSlice';
import { addOrder } from '../redux/ordersSlice';
import { useToast } from '../components/Toast';
import './Checkout.css';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { success } = useToast();
    const { items, totalAmount } = useSelector(state => state.cart);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    const [submitted, setSubmitted] = useState(false);

    if (items.length === 0 && !submitted) {
        navigate('/cart');
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create order object
        const order = {
            customer: {
                name: formData.fullName, // Corrected from formData.name to formData.fullName
                email: formData.email
            },
            items: items.map(item => ({
                bookId: item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.price
            })),
            total: totalAmount,
            address: `${formData.address}, ${formData.city}`
        };

        // Save order to Redux
        dispatch(addOrder(order));

        // Clear cart
        dispatch(clearCart());

        // Show success and navigate
        success('Đặt hàng thành công!');
        navigate('/checkout-success');
    };

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
                            <p><strong>Họ tên:</strong> {formData.fullName}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
                            <p><strong>Số điện thoại:</strong> {formData.phone}</p>
                            <p><strong>Địa chỉ:</strong> {formData.address}, {formData.city}</p>
                            <p><strong>Tổng tiền:</strong> <span className="success-total">{totalAmount.toLocaleString('vi-VN')}₫</span></p>
                        </div>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
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
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="input"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="input"
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Địa chỉ *</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="Số nhà, tên đường"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">Thành phố *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="input"
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
                                <label htmlFor="notes">Ghi chú (không bắt buộc)</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="input"
                                    rows="4"
                                    placeholder="Ghi chú về đơn hàng..."
                                />
                            </div>

                            <button type="submit" className="btn btn-primary submit-btn">
                                Xác nhận đặt hàng
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3>Đơn hàng của bạn</h3>

                        <div className="order-items">
                            {items.map((item) => (
                                <div key={item.id} className="order-item">
                                    <img src={item.image} alt={item.title} />
                                    <div className="order-item-info">
                                        <p className="order-item-title">{item.title}</p>
                                        <p className="order-item-quantity">Số lượng: {item.quantity}</p>
                                    </div>
                                    <p className="order-item-price">{item.totalPrice.toLocaleString('vi-VN')}₫</p>
                                </div>
                            ))}
                        </div>

                        <div className="order-total-section">
                            <div className="order-row">
                                <span>Tạm tính:</span>
                                <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="order-row">
                                <span>Phí vận chuyển:</span>
                                <span className="free-text">Miễn phí</span>
                            </div>
                            <div className="order-divider"></div>
                            <div className="order-row total">
                                <span>Tổng cộng:</span>
                                <span className="total-price">{totalAmount.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
