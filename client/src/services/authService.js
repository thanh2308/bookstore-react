import api from './api';

export const authService = {
    // 1. Đăng ký người dùng mới
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // 2. Đăng nhập
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // 3. Đăng xuất
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // 4. Lấy thông tin user hiện tại
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // 5. Cập nhật profile
    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        if (response.data.success) {
            // Cập nhật lại thông tin user mới trong localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // 6. Đổi mật khẩu
    changePassword: async (passwords) => {
        const response = await api.put('/auth/change-password', passwords);
        return response.data;
    },

    // 7. Quên mật khẩu (Gửi email)
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // 8. Đặt lại mật khẩu mới (Reset)
    resetPassword: async (token, password) => {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    }
};

export default authService;