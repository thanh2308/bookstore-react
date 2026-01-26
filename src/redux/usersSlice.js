import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    users: [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            role: 'user',
            status: 'active',
            joinDate: '2024-01-15',
            totalOrders: 5
        },
        {
            id: 2,
            name: 'Trần Thị B',
            email: 'tranthib@email.com',
            role: 'user',
            status: 'active',
            joinDate: '2024-01-20',
            totalOrders: 2
        },
        {
            id: 3,
            name: 'Admin User',
            email: 'admin@bookstore.vn',
            role: 'admin',
            status: 'active',
            joinDate: '2024-01-01',
            totalOrders: 0
        }
    ]
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        toggleUserStatus: (state, action) => {
            const user = state.users.find(u => u.id === action.payload);
            if (user) {
                user.status = user.status === 'active' ? 'blocked' : 'active';
            }
        },

        updateUserRole: (state, action) => {
            const { userId, role } = action.payload;
            const user = state.users.find(u => u.id === userId);
            if (user) {
                user.role = role;
            }
        }
    }
});

export const { toggleUserStatus, updateUserRole } = usersSlice.actions;
export default usersSlice.reducer;
