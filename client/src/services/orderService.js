import api from './api';

export const orderService = {
    // Create new order
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data.order;
    },

    // Get my orders
    getMyOrders: async () => {
        const response = await api.get('/orders/myorders');
        return response.data.orders;
    },

    // Get order by ID
    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data.order;
    },

    // Cancel order
    cancelOrder: async (id, reason) => {
        const response = await api.put(`/orders/${id}/cancel`, { reason });
        return response.data.order;
    },

    // Update payment status
    updatePayment: async (id, paymentData) => {
        const response = await api.put(`/orders/${id}/pay`, paymentData);
        return response.data.order;
    },

    // Get all orders (Admin)
    getAllOrders: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.status) {
            params.append('status', filters.status);
        }
        if (filters.page) {
            params.append('page', filters.page);
        }
        if (filters.limit) {
            params.append('limit', filters.limit);
        }

        const response = await api.get(`/orders?${params.toString()}`);
        return response.data.orders;
    },

    // Update order status (Admin)
    updateOrderStatus: async (id, status, note) => {
        const response = await api.put(`/orders/${id}/status`, { status, note });
        return response.data.order;
    }
};

export default orderService;
