import React from "react";
import { useDispatch } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/cartSlice";
import "./CartItem.css";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const rawStock = item.stockQuantity ?? item.countInStock;
  const hasKnownStock = Number.isFinite(rawStock) && rawStock >= 0;
  const availableStock = hasKnownStock ? rawStock : null;
  const isOutOfStock = hasKnownStock && availableStock === 0;
  const reachedStockLimit = hasKnownStock && item.quantity >= availableStock;
  const itemId = item._id || item.id;

  const handleIncrease = () => {
    // ❗ Chặn vượt tồn kho
    if (isOutOfStock || reachedStockLimit) return;
    dispatch(increaseQuantity(itemId));
  };

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.title} className="cart-item-image" />

      <div className="cart-item-details">
        <h3 className="cart-item-title">{item.title}</h3>
        <p className="cart-item-author">{item.author}</p>

        {/* ✅ Hiển thị tồn kho */}
        <p className="stock">
          Còn lại: {hasKnownStock ? availableStock : "--"}
        </p>

        <p className="cart-item-price">{item.price.toLocaleString("vi-VN")}₫</p>
      </div>

      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button
            onClick={() => dispatch(decreaseQuantity(itemId))}
            className="quantity-btn"
            disabled={item.quantity <= 1}
          >
            −
          </button>

          <span className="quantity-display">{item.quantity}</span>

          <button
            onClick={handleIncrease}
            className="quantity-btn"
            disabled={isOutOfStock || reachedStockLimit} // ❗ disable luôn
          >
            +
          </button>
        </div>

        <div className="cart-item-total">
          <span className="total-price">
            {(item.price * item.quantity).toLocaleString("vi-VN")}₫
          </span>
        </div>

        <button
          onClick={() => dispatch(removeFromCart(itemId))}
          className="remove-btn"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

export default CartItem;
