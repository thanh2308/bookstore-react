import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null
};

// Load từ localStorage
const loadAuthFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            return {
                user: JSON.parse(user),
                isAuthenticated: true,
                token
            };
        }
    } catch (error) {
        console.error('Error loading auth:', error);
    }
    return initialState;
};

const authSlice = createSlice({
    name: 'auth',
    initialState: loadAuthFromStorage(),
    reducers: {
        login: (state, action) => {
            const { email, name } = action.payload;
            const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
            state.user = { email, name, role };
            state.isAuthenticated = true;
            state.token = 'demo-token-' + Date.now();

            // Lưu vào localStorage
            localStorage.setItem('user', JSON.stringify(state.user));
            localStorage.setItem('token', state.token);
        },

        register: (state, action) => {
            const { email, name } = action.payload;
            const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
            state.user = { email, name, role };
            state.isAuthenticated = true;
            state.token = 'demo-token-' + Date.now();

            localStorage.setItem('user', JSON.stringify(state.user));
            localStorage.setItem('token', state.token);
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;

            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
});

export const { login, register, logout } = authSlice.actions;
export default authSlice.reducer;
