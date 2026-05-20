import api from './api';

export const promotionService = {
    // Get all promotions
    getPromotions: async (activeOnly = false) => {
        const params = activeOnly ? '?active=true' : '';
        const response = await api.get(`/promotions${params}`);
        return response.data;
    },

    // Get single promotion
    getPromotion: async (id) => {
        const response = await api.get(`/promotions/${id}`);
        return response.data;
    },

    // Validate promotion code
    validatePromotion: async (code, orderAmount) => {
        const response = await api.post('/promotions/validate', {
            code,
            orderAmount
        });
        return response.data;
    },

    // Apply promotion
    applyPromotion: async (code, userId) => {
        const response = await api.post('/promotions/apply', {
            code,
            userId
        });
        return response.data;
    },

    // Create promotion (Admin)
    createPromotion: async (promotionData) => {
        const response = await api.post('/promotions', promotionData);
        return response.data;
    },

    // Update promotion (Admin)
    updatePromotion: async (id, promotionData) => {
        const response = await api.put(`/promotions/${id}`, promotionData);
        return response.data;
    },

    // Delete promotion (Admin)
    deletePromotion: async (id) => {
        const response = await api.delete(`/promotions/${id}`);
        return response.data;
    }
};

export default promotionService;
