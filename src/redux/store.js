import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import booksReducer from './booksSlice';
import authReducer from './authSlice';
import wishlistReducer from './wishlistSlice';
import ordersReducer from './ordersSlice';
import usersReducer from './usersSlice';
import promotionsReducer from './promotionsSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        books: booksReducer,
        auth: authReducer,
        wishlist: wishlistReducer,
        orders: ordersReducer,
        users: usersReducer,
        promotions: promotionsReducer
    }
});
