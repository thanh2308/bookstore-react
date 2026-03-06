import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookService from '../services/bookService';

const initialState = {
    allBooks: [],
    filteredBooks: [],
    selectedCategory: 'Tất cả',
    searchQuery: '',
    sortBy: 'default',
    priceRange: [0, 500000],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    total: 0
};

// Async thunks
export const fetchBooks = createAsyncThunk(
    'books/fetchBooks',
    async (filters, { rejectWithValue }) => {
        try {
            const data = await bookService.getBooks(filters);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBookById = createAsyncThunk(
    'books/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await bookService.getBook(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createBook = createAsyncThunk(
    'books/create',
    async (bookData, { rejectWithValue }) => {
        try {
            const data = await bookService.createBook(bookData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBook = createAsyncThunk(
    'books/update',
    async ({ id, bookData }, { rejectWithValue }) => {
        try {
            const data = await bookService.updateBook(id, bookData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBook = createAsyncThunk(
    'books/delete',
    async (id, { rejectWithValue }) => {
        try {
            await bookService.deleteBook(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addBookReview = createAsyncThunk(
    'books/addReview',
    async ({ id, reviewData }, { rejectWithValue }) => {
        try {
            const data = await bookService.addReview(id, reviewData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const booksSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setPriceRange: (state, action) => {
            state.priceRange = action.payload;
        },
        setPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch books
            .addCase(fetchBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBooks.fulfilled, (state, action) => {
                state.loading = false;
                state.allBooks = action.payload.books;
                state.filteredBooks = action.payload.books;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.total = action.payload.total;
            })
            .addCase(fetchBooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create book
            .addCase(createBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBook.fulfilled, (state, action) => {
                state.loading = false;
                state.allBooks.push(action.payload.book);
            })
            .addCase(createBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update book
            .addCase(updateBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBook.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.allBooks.findIndex(b => b._id === action.payload.book._id);
                if (index >= 0) {
                    state.allBooks[index] = action.payload.book;
                }
            })
            .addCase(updateBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete book
            .addCase(deleteBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBook.fulfilled, (state, action) => {
                state.loading = false;
                state.allBooks = state.allBooks.filter(b => b._id !== action.payload);
            })
            .addCase(deleteBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setSearchQuery,
    setCategory,
    setSortBy,
    setPriceRange,
    setPage,
    clearError
} = booksSlice.actions;

export default booksSlice.reducer;

