import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null
};

// 💡 Helper function: Chuyên dùng để "đào" ra câu báo lỗi chính xác từ Backend
const extractErrorMessage = (error) => {
    return (
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
    );
};

// Load from localStorage
const loadAuthFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            return {
                user: JSON.parse(user),
                isAuthenticated: true,
                token,
                loading: false,
                error: null
            };
        }
    } catch (error) {
        console.error('Error loading auth:', error);
    }
    return initialState;
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await authService.login(credentials);
            return data;
        } catch (error) {
            // Đã sửa: Lấy chính xác câu báo lỗi từ Backend
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const data = await authService.register(userData);
            return data;
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const data = await authService.updateProfile(userData);
            return data;
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const data = await authService.getMe();
            return data;
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, thunkAPI) => {
        try {
            return await authService.changePassword(passwordData);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Lỗi đổi mật khẩu';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, thunkAPI) => {
        try {
            return await authService.updateProfile(userData);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Lỗi cập nhật thông tin';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: loadAuthFromStorage(),
    reducers: {
        logout: (state) => {
            authService.logout();
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; 
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Current User
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;