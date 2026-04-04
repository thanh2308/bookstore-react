import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../services/orderService';

const initialState = {
    myOrders: [],
    allOrders: [], // For admin
    currentOrder: null,
    loading: false,
    error: null
};

// Async thunks
export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData, { rejectWithValue }) => {
        try {
            const data = await orderService.createOrder(orderData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchMyOrders = createAsyncThunk(
    'orders/fetchMyOrders',
    async (_, { rejectWithValue }) => {
        try {
            const data = await orderService.getMyOrders();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await orderService.getOrderById(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'orders/cancel',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const data = await orderService.cancelOrder(id, reason);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAll',
    async (filters, { rejectWithValue }) => {
        try {
            const data = await orderService.getAllOrders(filters);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ id, status, note }, { rejectWithValue }) => {
        try {
            const data = await orderService.updateOrderStatus(id, status, note);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.order;
                state.myOrders.unshift(action.payload.order);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch my orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.myOrders = action.payload.orders;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.order;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Cancel order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentOrder && state.currentOrder._id === action.payload.order._id) {
                    state.currentOrder = action.payload.order;
                }
                // Update in myOrders list
                const index = state.myOrders.findIndex(o => o._id === action.payload.order._id);
                if (index >= 0) {
                    state.myOrders[index] = action.payload.order;
                }
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch all orders (Admin)
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.allOrders = action.payload.orders;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update order status (Admin)
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.allOrders.findIndex(o => o._id === action.payload.order._id);
                if (index >= 0) {
                    state.allOrders[index] = action.payload.order;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
