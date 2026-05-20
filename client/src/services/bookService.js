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
            if (key === 'image') {
                // If image is a File object, append it for multipart upload
                if (bookData[key] instanceof File) {
                    formData.append('image', bookData[key]);
                }
                // If image is a URL string, append it as regular data
                else if (typeof bookData[key] === 'string' && bookData[key]) {
                    formData.append('image', bookData[key]);
                }
                // If image is empty, don't append (will use default or existing)
            } else if (bookData[key] !== undefined && bookData[key] !== '') {
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
            if (key === 'image') {
                // If image is a File object, append it for multipart upload
                if (bookData[key] instanceof File) {
                    formData.append('image', bookData[key]);
                }
                // If image is a URL string, append it as regular data
                else if (typeof bookData[key] === 'string' && bookData[key]) {
                    formData.append('image', bookData[key]);
                }
                // If image is empty, don't append (will keep existing)
            } else if (bookData[key] !== undefined && bookData[key] !== '') {
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
        try {
            const response = await api.post(`/books/${id}/reviews`, reviewData);
            return response.data;
        } catch (error) {
            console.log('Review API error:', error.response?.data);
            throw error;
        }
    },

    // Update stock (Admin)
    updateStock: async (id, stockQuantity) => {
        const response = await api.put(`/books/${id}/stock`, { stockQuantity });
        return response.data;
    }
};

export default bookService;
