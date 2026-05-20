import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBooks, deleteBook, createBook, updateBook } from '../../redux/booksSlice';
import { useToast } from '../../components/Toast';
import BookFormModal from '../components/BookFormModal';
import { getOptimizedImageUrl } from '../../services/api';
import AppIcon from '../../components/AppIcon';
import './BooksManagement.css';

const BooksManagement = () => {
    const dispatch = useDispatch();
    const { success, error: showError } = useToast();
    const { allBooks, loading } = useSelector(state => state.books);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        dispatch(fetchBooks({}));
    }, [dispatch]);

    const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        if (deleteTarget) {
            const result = await dispatch(deleteBook(deleteTarget.id));
            if (deleteBook.fulfilled.match(result)) {
                success('Đã xóa sách thành công!');
                setDeleteTarget(null);
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
                <div className="admin-table-skeleton" aria-label="Đang tải sách">
                    {[1, 2, 3, 4, 5].map((item) => <span className="skeleton admin-row-skeleton" key={item} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="books-management">
            <div className="page-header">
                <h1><AppIcon name="book" size={28} /> Quản Lý Sách</h1>
                <button onClick={handleAddNew} className="btn btn-primary">
                    <AppIcon name="plus" size={16} /> Thêm Sách Mới
                </button>
            </div>

            <div className="admin-toolbar">
                {selectedIds.length > 0 && (
                    <div className="bulk-actions">
                        <strong>{selectedIds.length} đã chọn</strong>
                        <button type="button" className="btn btn-secondary">Ẩn hàng loạt</button>
                        <button type="button" className="btn btn-danger">Xóa hàng loạt</button>
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Tìm sách theo tên hoặc tác giả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-admin"
                />
                <select className="filter-select" aria-label="Lọc theo thể loại">
                    <option>Tất cả thể loại</option>
                    <option>Kỹ năng sống</option>
                    <option>Tiểu thuyết</option>
                    <option>Khoa học</option>
                    <option>Kinh tế</option>
                </select>
                <span className="search-count">{filteredBooks.length} sách</span>
            </div>

            <div className="books-table-container">
                <table className="books-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    aria-label="Chọn tất cả sách"
                                    checked={filteredBooks.length > 0 && selectedIds.length === filteredBooks.length}
                                    onChange={(event) => setSelectedIds(event.target.checked ? filteredBooks.map((book) => book._id || book.id) : [])}
                                />
                            </th>
                            <th>Cover</th>
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
                                    <input
                                        type="checkbox"
                                        aria-label={`Chọn ${book.title}`}
                                        checked={selectedIds.includes(book._id || book.id)}
                                        onChange={(event) => {
                                            const id = book._id || book.id;
                                            setSelectedIds((current) => event.target.checked ? [...current, id] : current.filter((item) => item !== id));
                                        }}
                                    />
                                </td>
                                <td>
                                    <img src={getOptimizedImageUrl(book.coverImage || book.image, "w_140,f_auto,q_auto")} alt={book.title} className="book-thumb" />
                                </td>
                                <td className="book-title-cell">{book.title}</td>
                                <td>{book.author}</td>
                                <td><span className="category-badge">{book.category}</span></td>
                                <td className="price-cell">{book.price.toLocaleString()}₫</td>
                                <td>
                                    <span className="rating-badge"><AppIcon name="star" size={14} fill="currentColor" /> {book.rating?.toFixed(1) || 'N/A'}</span>
                                </td>
                                <td>
                                    <span className={`stock-badge ${book.inStock ? 'in-stock' : 'out-stock'}`}>
                                        {book.stockQuantity || 0} cuốn
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(book)} className="btn-edit">
                                            <AppIcon name="edit" size={16} />
                                        </button>
                                        <button onClick={() => setDeleteTarget({ id: book._id || book.id, title: book.title })} className="btn-delete" aria-label={`Xóa ${book.title}`}>
                                            <AppIcon name="trash" size={16} />
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

            {deleteTarget && (
                <div className="admin-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-book-title">
                    <div className="admin-confirm-modal">
                        <h2 id="delete-book-title">Xóa sách?</h2>
                        <p>Sách "{deleteTarget.title}" sẽ bị xóa khỏi hệ thống.</p>
                        <div className="admin-confirm-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Hủy</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksManagement;
