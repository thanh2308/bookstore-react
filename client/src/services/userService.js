import api from './api';

export const userService = {
    // Get all users (Admin)
    getUsers: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.page) {
            params.append('page', filters.page);
        }
        if (filters.limit) {
            params.append('limit', filters.limit);
        }

        const response = await api.get(`/users?${params.toString()}`);
        return response.data;
    },

    // Get user by ID (Admin)
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Update user (Admin)
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    // Delete user (Admin)
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    toggleUserBlock: async (id) => {
        const response = await api.put(`/users/${id}/block`);
        return response.data;
    },

    // Address management
    addAddress: async (addressData) => {
        const response = await api.post('/users/address', addressData);
        return response.data;
    },

    updateAddress: async (addressId, addressData) => {
        const response = await api.put(`/users/address/${addressId}`, addressData);
        return response.data;
    },

    deleteAddress: async (addressId) => {
        const response = await api.delete(`/users/address/${addressId}`);
        return response.data;
    },

    // Wishlist management
    getWishlist: async () => {
        const response = await api.get('/users/wishlist');
        return response.data;
    },

    toggleWishlist: async (bookId) => {
        const response = await api.post(`/users/wishlist/${bookId}`);
        return response.data;
    }
};

export default userService;
