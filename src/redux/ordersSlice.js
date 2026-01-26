import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orders: [
        {
            id: 1,
            customer: { name: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
            items: [
                { bookId: 1, title: 'Đắc Nhân Tâm', quantity: 2, price: 86000 }
            ],
            total: 172000,
            status: 'pending',
            date: '2024-01-26',
            address: '123 Đường ABC, Hà Nội'
        },
        {
            id: 2,
            customer: { name: 'Trần Thị B', email: 'tranthib@email.com' },
            items: [
                { bookId: 2, title: 'Nhà Giả Kim', quantity: 1, price: 67000 },
                { bookId: 4, title: 'Atomic Habits', quantity: 1, price: 179000 }
            ],
            total: 246000,
            status: 'processing',
            date: '2024-01-25',
            address: '456 Đường XYZ, TP HCM'
        }
    ]
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        addOrder: (state, action) => {
            const newOrder = {
                ...action.payload,
                id: state.orders.length > 0 ? Math.max(...state.orders.map(o => o.id)) + 1 : 1,
                status: 'pending',
                date: new Date().toISOString().split('T')[0]
            };
            state.orders.unshift(newOrder);
        },

        updateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload;
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
            }
        }
    }
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
