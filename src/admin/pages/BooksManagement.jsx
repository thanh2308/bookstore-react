import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBooks, deleteBook, createBook, updateBook } from '../../redux/booksSlice';
import { useToast } from '../../components/Toast';
import BookFormModal from '../components/BookFormModal';
import './BooksManagement.css';

const BooksManagement = () => {
    const dispatch = useDispatch();
    const { success, error: showError } = useToast();
    const { allBooks, loading } = useSelector(state => state.books);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchBooks({}));
    }, [dispatch]);

    const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (bookId, bookTitle) => {
        if (window.confirm(`Xóa sách "${bookTitle}"?`)) {
            const result = await dispatch(deleteBook(bookId));
            if (deleteBook.fulfilled.match(result)) {
                success('Đã xóa sách thành công!');
            } else {
                showError('Lỗi khi xóa sách');
            }
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingBook(null);
        setShowModal(true);
    };

    const handleSaveBook = async (bookData) => {
        if (editingBook) {
            const result = await dispatch(updateBook({ id: editingBook._id || editingBook.id, bookData }));
            if (updateBook.fulfilled.match(result)) {
                success('Đã cập nhật sách!');
                setShowModal(false);
            }
        } else {
            const result = await dispatch(createBook(bookData));
            if (createBook.fulfilled.match(result)) {
                success('Đã thêm sách mới!');
                setShowModal(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="books-management">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải sách...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="books-management">
            <div className="page-header">
                <h1>📚 Quản Lý Sách</h1>
                <button onClick={handleAddNew} className="btn btn-primary">
                    ➕ Thêm Sách Mới
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm sách theo tên hoặc tác giả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-admin"
                />
                <span className="search-count">{filteredBooks.length} sách</span>
            </div>

            <div className="books-table-container">
                <table className="books-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên Sách</th>
                            <th>Tác Giả</th>
                            <th>Thể Loại</th>
                            <th>Giá</th>
                            <th>Rating</th>
                            <th>Kho</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map((book) => (
                            <tr key={book._id || book.id}>
                                <td>
                                    <img src={book.image} alt={book.title} className="book-thumb" />
                                </td>
                                <td className="book-title-cell">{book.title}</td>
                                <td>{book.author}</td>
                                <td><span className="category-badge">{book.category}</span></td>
                                <td className="price-cell">{book.price.toLocaleString()}₫</td>
                                <td>
                                    <span className="rating-badge">⭐ {book.rating?.toFixed(1) || 'N/A'}</span>
                                </td>
                                <td>
                                    <span className={`stock-badge ${book.inStock ? 'in-stock' : 'out-stock'}`}>
                                        {book.stockQuantity || 0} cuốn
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(book)} className="btn-edit">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(book._id || book.id, book.title)} className="btn-delete">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <BookFormModal
                    book={editingBook}
                    onSave={handleSaveBook}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default BooksManagement;
