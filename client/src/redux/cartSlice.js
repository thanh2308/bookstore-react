import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;
            const itemId = newItem._id || newItem.id;
            const existingItem = state.items.find(item => (item._id || item.id) === itemId);

            if (existingItem) {
                existingItem.quantity++;
                existingItem.totalPrice = existingItem.price * existingItem.quantity;
            } else {
                state.items.push({
                    _id: newItem._id || newItem.id, // MongoDB ID
                    id: newItem.id || newItem._id,   // Fallback ID
                    title: newItem.title,
                    author: newItem.author,
                    price: newItem.price,
                    image: newItem.image,
                    quantity: 1,
                    totalPrice: newItem.price
                });
            }

            state.totalQuantity++;
            state.totalAmount += newItem.price;
        },

        removeFromCart: (state, action) => {
            const id = action.payload;
            const existingItem = state.items.find(item => (item._id || item.id) === id);

            if (existingItem) {
                state.totalQuantity -= existingItem.quantity;
                state.totalAmount -= existingItem.totalPrice;
                state.items = state.items.filter(item => (item._id || item.id) !== id);
            }
        },

        increaseQuantity: (state, action) => {
            const id = action.payload;
            const existingItem = state.items.find(item => (item._id || item.id) === id);

            if (existingItem) {
                existingItem.quantity++;
                existingItem.totalPrice = existingItem.price * existingItem.quantity;
                state.totalQuantity++;
                state.totalAmount += existingItem.price;
            }
        },

        decreaseQuantity: (state, action) => {
            const id = action.payload;
            const existingItem = state.items.find(item => (item._id || item.id) === id);

            if (existingItem && existingItem.quantity > 1) {
                existingItem.quantity--;
                existingItem.totalPrice = existingItem.price * existingItem.quantity;
                state.totalQuantity--;
                state.totalAmount -= existingItem.price;
            }
        },

        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
        }
    }
});

export const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
