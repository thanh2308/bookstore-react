import { createSlice } from "@reduxjs/toolkit";

// Lấy dữ liệu đã lưu
const savedCart = localStorage.getItem("cart");

const initialState = savedCart
  ? JSON.parse(savedCart)
  : {
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
    };

// Hàm lưu localStorage
const saveCartToLocalStorage = (state) => {
  localStorage.setItem("cart", JSON.stringify(state));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const itemId = newItem._id || newItem.id;
      const addedQuantity = newItem.quantity || 1;
      const maxStock =
        Number.isFinite(newItem.stockQuantity) && newItem.stockQuantity > 0
          ? newItem.stockQuantity
          : null;
      const hasStockQuantity = Number.isFinite(maxStock);

      // Check hết hàng ngay từ đầu (hỗ trợ cả payload chỉ có inStock)
      if (newItem.inStock === false || (hasStockQuantity && maxStock === 0)) {
        return;
      }

      const existingItem = state.items.find(
        (item) => (item._id || item.id) === itemId,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + addedQuantity;
        const existingMaxStock =
          Number.isFinite(existingItem.stockQuantity) &&
          existingItem.stockQuantity > 0
            ? existingItem.stockQuantity
            : null;
        const existingHasStockQuantity = Number.isFinite(existingMaxStock);

        existingItem.quantity =
          existingHasStockQuantity && newQuantity > existingMaxStock
            ? existingMaxStock
            : newQuantity;

        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        const validQuantity =
          hasStockQuantity && addedQuantity > maxStock
            ? maxStock
            : addedQuantity;

        state.items.push({
          _id: itemId,
          id: itemId,
          title: newItem.title,
          author: newItem.author,
          price: newItem.price,
          image: newItem.image,
          stockQuantity: maxStock,
          quantity: validQuantity,
          totalPrice: newItem.price * validQuantity,
        });
      }

      // Tính lại tổng
      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );

      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );

      localStorage.setItem("cart", JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      const id = action.payload;

      const existingItem = state.items.find(
        (item) => (item._id || item.id) === id,
      );

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.totalPrice;

        state.items = state.items.filter(
          (item) => (item._id || item.id) !== id,
        );
      }

      saveCartToLocalStorage(state);
    },

    increaseQuantity: (state, action) => {
      const id = action.payload;

      const existingItem = state.items.find(
        (item) => (item._id || item.id) === id,
      );

      if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;

        state.totalQuantity++;
        state.totalAmount += existingItem.price;
      }

      saveCartToLocalStorage(state);
    },

    decreaseQuantity: (state, action) => {
      const id = action.payload;

      const existingItem = state.items.find(
        (item) => (item._id || item.id) === id,
      );

      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity--;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;

        state.totalQuantity--;
        state.totalAmount -= existingItem.price;
      }

      saveCartToLocalStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;

      localStorage.removeItem("cart");
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
