import React from 'react';
import { useDispatch } from 'react-redux';
import { increaseQuantity, decreaseQuantity, removeFromCart } from '../redux/cartSlice';
import './CartItem.css';

const CartItem = ({ item }) => {
    const dispatch = useDispatch();

    return (
        <div className="cart-item">
            <img src={item.image} alt={item.title} className="cart-item-image" />

            <div className="cart-item-details">
                <h3 className="cart-item-title">{item.title}</h3>
                <p className="cart-item-author">{item.author}</p>
                <p className="cart-item-price">{item.price.toLocaleString('vi-VN')}₫</p>
            </div>

            <div className="cart-item-controls">
                <div className="quantity-controls">
                    <button
                        onClick={() => dispatch(decreaseQuantity(item.id))}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                    >
                        −
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button onClick={() => dispatch(increaseQuantity(item.id))} className="quantity-btn">
                        +
                    </button>
                </div>

                <div className="cart-item-total">
                    <span className="total-price">{item.totalPrice.toLocaleString('vi-VN')}₫</span>
                </div>

                <button onClick={() => dispatch(removeFromCart(item.id))} className="remove-btn">
                    🗑️ Xóa
                </button>
            </div>
        </div>
    );
};

export default CartItem;
