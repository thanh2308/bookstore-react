import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteBook, toggleBookStock } from '../../redux/booksSlice';
import { useToast } from '../../components/Toast';
import BookFormModal from '../components/BookFormModal';
import './BooksManagement.css';

const BooksManagement = () => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const allBooks = useSelector(state => state.books.allBooks);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (bookId, bookTitle) => {
        if (window.confirm(`Xóa sách "${bookTitle}"?`)) {
            dispatch(deleteBook(bookId));
            success('Đã xóa sách thành công!');
        }
    };

    const handleToggleStock = (bookId) => {
        dispatch(toggleBookStock(bookId));
        success('Đã cập nhật trạng thái!');
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingBook(null);
        setShowModal(true);
    };

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
                            <th>Tồn Kho</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map((book) => (
                            <tr key={book.id}>
                                <td>
                                    <img src={book.image} alt={book.title} className="book-thumb" />
                                </td>
                                <td className="book-title-cell">{book.title}</td>
                                <td>{book.author}</td>
                                <td><span className="category-badge">{book.category}</span></td>
                                <td className="price-cell">{book.price.toLocaleString()}₫</td>
                                <td>
                                    <span className="rating-badge">⭐ {book.rating}</span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleToggleStock(book.id)}
                                        className={`stock-badge ${book.inStock ? 'in-stock' : 'out-stock'}`}
                                    >
                                        {book.inStock ? '✓ Còn hàng' : '✕ Hết hàng'}
                                    </button>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(book)} className="btn-edit">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(book.id, book.title)} className="btn-delete">
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
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default BooksManagement;
