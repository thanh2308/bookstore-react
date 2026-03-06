import api from './api';

export const bookService = {
    // Get all books with filters
    getBooks: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.category && filters.category !== 'Tất cả') {
            params.append('category', filters.category);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.sortBy) {
            params.append('sortBy', filters.sortBy);
        }
        if (filters.minPrice) {
            params.append('minPrice', filters.minPrice);
        }
        if (filters.maxPrice) {
            params.append('maxPrice', filters.maxPrice);
        }
        if (filters.page) {
            params.append('page', filters.page);
        }
        if (filters.limit) {
            params.append('limit', filters.limit);
        }

        const response = await api.get(`/books?${params.toString()}`);
        return response.data;
    },

    // Get single book
    getBook: async (id) => {
        const response = await api.get(`/books/${id}`);
        return response.data;
    },

    // Create book (Admin)
    createBook: async (bookData) => {
        const formData = new FormData();

        Object.keys(bookData).forEach(key => {
            if (key === 'image' && bookData[key] instanceof File) {
                formData.append('image', bookData[key]);
            } else {
                formData.append(key, bookData[key]);
            }
        });

        const response = await api.post('/books', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Update book (Admin)
    updateBook: async (id, bookData) => {
        const formData = new FormData();

        Object.keys(bookData).forEach(key => {
            if (key === 'image' && bookData[key] instanceof File) {
                formData.append('image', bookData[key]);
            } else {
                formData.append(key, bookData[key]);
            }
        });

        const response = await api.put(`/books/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Delete book (Admin)
    deleteBook: async (id) => {
        const response = await api.delete(`/books/${id}`);
        return response.data;
    },

    // Add review
    addReview: async (id, reviewData) => {
        const response = await api.post(`/books/${id}/reviews`, reviewData);
        return response.data;
    },

    // Update stock (Admin)
    updateStock: async (id, stockQuantity) => {
        const response = await api.put(`/books/${id}/stock`, { stockQuantity });
        return response.data;
    }
};

export default bookService;
