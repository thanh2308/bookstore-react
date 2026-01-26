import { createSlice } from '@reduxjs/toolkit';

const loadWishlistFromStorage = () => {
    try {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        return [];
    }
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: loadWishlistFromStorage()
    },
    reducers: {
        toggleWishlist: (state, action) => {
            const bookId = action.payload;
            const index = state.items.indexOf(bookId);

            if (index >= 0) {
                state.items.splice(index, 1);
            } else {
                state.items.push(bookId);
            }

            localStorage.setItem('wishlist', JSON.stringify(state.items));
        },

        removeFromWishlist: (state, action) => {
            state.items = state.items.filter(id => id !== action.payload);
            localStorage.setItem('wishlist', JSON.stringify(state.items));
        }
    }
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
