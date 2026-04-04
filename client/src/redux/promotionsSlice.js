import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    promotions: [
        {
            id: 1,
            name: 'Giảm giá sách Kỹ năng sống - Tháng 1',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            discountRate: 0.15,
            categories: ['Kỹ năng sống'],
            isActive: true
        },
        {
            id: 2,
            name: 'Flash Sale Thiếu Nhi',
            startDate: '2024-01-20',
            endDate: '2024-01-27',
            discountRate: 0.25,
            categories: ['Thiếu nhi'],
            isActive: true
        }
    ]
};

const promotionsSlice = createSlice({
    name: 'promotions',
    initialState,
    reducers: {
        addPromotion: (state, action) => {
            const newPromotion = {
                ...action.payload,
                id: state.promotions.length > 0 ? Math.max(...state.promotions.map(p => p.id)) + 1 : 1,
                isActive: true
            };
            state.promotions.push(newPromotion);
        },

        updatePromotion: (state, action) => {
            const index = state.promotions.findIndex(p => p.id === action.payload.id);
            if (index >= 0) {
                state.promotions[index] = action.payload;
            }
        },

        deletePromotion: (state, action) => {
            state.promotions = state.promotions.filter(p => p.id !== action.payload);
        },

        togglePromotionActive: (state, action) => {
            const promotion = state.promotions.find(p => p.id === action.payload);
            if (promotion) {
                promotion.isActive = !promotion.isActive;
            }
        }
    }
});

export const { addPromotion, updatePromotion, deletePromotion, togglePromotionActive } = promotionsSlice.actions;
export default promotionsSlice.reducer;
