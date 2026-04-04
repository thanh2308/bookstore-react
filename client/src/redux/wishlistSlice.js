import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/userService';

const initialState = {
    wishlist: [],
    loading: false,
    error: null
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const data = await userService.getWishlist();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleWishlistItem = createAsyncThunk(
    'wishlist/toggle',
    async (bookId, { rejectWithValue }) => {
        try {
            const data = await userService.toggleWishlist(bookId);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload.wishlist;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle wishlist item
            .addCase(toggleWishlistItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleWishlistItem.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload.wishlist;
            })
            .addCase(toggleWishlistItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
