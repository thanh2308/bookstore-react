import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookService from "../services/bookService";

const initialState = {
  allBooks: [],
  filteredBooks: [],
  currentBook: null,
  selectedCategory: "Tất cả",
  searchQuery: "",
  sortBy: "default",
  priceRange: [0, 500000],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
};

// =================== Async thunks ===================

// Lấy danh sách sách
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (filters, { rejectWithValue }) => {
    try {
      const data = await bookService.getBooks(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Lấy chi tiết 1 sách theo id
export const fetchBookById = createAsyncThunk(
  "books/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await bookService.getBook(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Tạo sách mới
export const createBook = createAsyncThunk(
  "books/create",
  async (bookData, { rejectWithValue }) => {
    try {
      const data = await bookService.createBook(bookData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Cập nhật sách
export const updateBook = createAsyncThunk(
  "books/update",
  async ({ id, bookData }, { rejectWithValue }) => {
    try {
      const data = await bookService.updateBook(id, bookData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Xóa sách
export const deleteBook = createAsyncThunk(
  "books/delete",
  async (id, { rejectWithValue }) => {
    try {
      await bookService.deleteBook(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Thêm đánh giá
export const addBookReview = createAsyncThunk(
  "books/addReview",
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const data = await bookService.addReview(id, reviewData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// =================== Slice ===================

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ===== Fetch all books =====
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.allBooks = action.payload.books || [];
        state.filteredBooks = action.payload.books || [];
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== Fetch book by ID =====
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentBook = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload.book || action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentBook = null;
      })

      // ===== Create book =====
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

      // ===== Update book =====
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;

        const updatedBook = action.payload.book;
        const index = state.allBooks.findIndex(
          (b) => b._id === updatedBook._id,
        );

        if (index >= 0) {
          state.allBooks[index] = updatedBook;
        }

        if (state.currentBook && state.currentBook._id === updatedBook._id) {
          state.currentBook = updatedBook;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== Delete book =====
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.allBooks = state.allBooks.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setCategory,
  setSortBy,
  setPriceRange,
  setPage,
  clearError,
} = booksSlice.actions;

export default booksSlice.reducer;
