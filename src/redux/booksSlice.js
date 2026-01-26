import { createSlice } from '@reduxjs/toolkit';
import { mockBooks } from '../data/mockBooks';

const initialState = {
    allBooks: mockBooks,
    filteredBooks: mockBooks,
    selectedCategory: 'Tất cả',
    searchQuery: '',
    sortBy: 'default',
    priceRange: [0, 500000]
};

const applyFilters = (state) => {
    let books = state.allBooks;

    // Apply search
    if (state.searchQuery) {
        books = books.filter(book =>
            book.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
    }

    // Apply category
    if (state.selectedCategory !== 'Tất cả') {
        books = books.filter(book => book.category === state.selectedCategory);
    }

    // Apply price range
    books = books.filter(book => book.price >= state.priceRange[0] && book.price <= state.priceRange[1]);

    // Apply sort
    switch (state.sortBy) {
        case 'price-asc':
            books = [...books].sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            books = [...books].sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            books = [...books].sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            books = [...books].sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            break;
    }

    state.filteredBooks = books;
};

const booksSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            applyFilters(state);
        },

        setCategory: (state, action) => {
            state.selectedCategory = action.payload;
            applyFilters(state);
        },

        setSortBy: (state, action) => {
            state.sortBy = action.payload;
            applyFilters(state);
        },

        setPriceRange: (state, action) => {
            state.priceRange = action.payload;
            applyFilters(state);
        },

        // Admin CRUD actions
        addBook: (state, action) => {
            const newBook = {
                ...action.payload,
                id: state.allBooks.length > 0 ? Math.max(...state.allBooks.map(b => b.id)) + 1 : 1
            };
            state.allBooks.push(newBook);
            applyFilters(state);
        },

        updateBook: (state, action) => {
            const index = state.allBooks.findIndex(b => b.id === action.payload.id);
            if (index >= 0) {
                state.allBooks[index] = action.payload;
                applyFilters(state);
            }
        },

        deleteBook: (state, action) => {
            state.allBooks = state.allBooks.filter(b => b.id !== action.payload);
            applyFilters(state);
        },

        toggleBookStock: (state, action) => {
            const book = state.allBooks.find(b => b.id === action.payload);
            if (book) {
                book.inStock = !book.inStock;
                applyFilters(state);
            }
        }
    }
});

export const { setSearchQuery, setCategory, setSortBy, setPriceRange, addBook, updateBook, deleteBook, toggleBookStock } = booksSlice.actions;
export default booksSlice.reducer;
