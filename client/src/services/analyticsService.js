import api from './api';

export const analyticsService = {
    getSummary: async () => {
        const response = await api.get('/analytics/summary');
        return response.data;
    },

    getRevenue: async (period = 'month') => {
        const response = await api.get(`/analytics/revenue?period=${period}`);
        return response.data;
    },

    getTopBooks: async (limit = 10) => {
        const response = await api.get(`/analytics/top-books?limit=${limit}`);
        return response.data;
    }
};

export default analyticsService;