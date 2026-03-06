import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartItem from '../components/CartItem';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { items, totalQuantity, totalAmount } = useSelector(state => state.cart);

    if (items.length === 0) {
        return (
            <div className="empty-cart-page">
                <div className="container">
                    <div className="empty-cart-content">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Giỏ hàng trống</h2>
                        <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                        <Link to="/" className="btn btn-primary">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>
                <p className="cart-subtitle">Bạn có {totalQuantity} sản phẩm trong giỏ hàng</p>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items-section">
                        {items.map((item) => (
                            <CartItem key={item._id || item.id} item={item} />
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Tổng sản phẩm:</span>
                                <span>{totalQuantity} món</span>
                            </div>

                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                            </div>

                            <div className="summary-row">
                                <span>Phí vận chuyển:</span>
                                <span className="free-shipping">Miễn phí</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Tổng cộng:</span>
                                <span className="total-amount">{totalAmount.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn btn-primary checkout-btn"
                        >
                            Tiến hành thanh toán
                        </button>

                        <Link to="/" className="continue-shopping">
                            ← Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
