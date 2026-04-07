import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, updateBook } from '../../redux/booksSlice';
import { useToast } from '../../components/Toast';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const dispatch = useDispatch();
    const { success, error: showError } = useToast();
    const allBooks = useSelector(state => state.books?.allBooks || []);
    const loading = useSelector(state => state.books.loading);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    const LOW_STOCK_THRESHOLD = 5;

    useEffect(() => {
        if (allBooks.length === 0) {
            dispatch(fetchBooks({ page: 1, limit: 100 }));
        }
    }, [dispatch, allBooks.length]);

    const lowStockBooks = useMemo(() => {
        return allBooks.filter(book => (book.stockQuantity || 0) <= LOW_STOCK_THRESHOLD);
    }, [allBooks]);

    const filteredBooks = useMemo(() => {
        return allBooks.filter((book) => {
            const title = (book.title || '').toLowerCase();
            const author = (book.author || '').toLowerCase();
            const keyword = searchTerm.toLowerCase();
            const matchesSearch = title.includes(keyword) || author.includes(keyword);
            const matchesLowStock = !showLowStockOnly || (book.stockQuantity || 0) <= LOW_STOCK_THRESHOLD;
            return matchesSearch && matchesLowStock;
        });
    }, [allBooks, searchTerm, showLowStockOnly]);

    const handleRestock = async (book, amount) => {
        try {
            const newQuantity = (book.stockQuantity || 0) + amount;
            await dispatch(updateBook({ id: book._id || book.id, bookData: { stockQuantity: newQuantity } })).unwrap();
            success(`Đã nhập ${amount} cuốn "${book.title}"!`);
        } catch (error) {
            showError(error || 'Không cập nhật được tồn kho');
        }
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'Hết hàng', class: 'out-of-stock' };
        if (quantity <= LOW_STOCK_THRESHOLD) return { text: 'Sắp hết', class: 'low-stock' };
        return { text: 'Còn hàng', class: 'in-stock' };
    };

    return (
        <div className="inventory-management">
            <h1>📦 Quản Lý Kho Hàng</h1>

            {loading && <div className="loading-state"><div className="spinner"></div><p>Đang tải kho hàng...</p></div>}

            {lowStockBooks.length > 0 && (
                <div className="alert-banner warning">
                    <span className="alert-icon">⚠️</span>
                    <div>
                        <strong>Cảnh báo tồn kho!</strong>
                        <p>{lowStockBooks.length} sản phẩm sắp hết hàng (≤ {LOW_STOCK_THRESHOLD} cuốn)</p>
                    </div>
                </div>
            )}

            <div className="inventory-filters">
                <input
                    type="text"
                    placeholder="Tìm sách theo tên hoặc tác giả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-admin"
                />

                <label className="checkbox-filter">
                    <input
                        type="checkbox"
                        checked={showLowStockOnly}
                        onChange={(e) => setShowLowStockOnly(e.target.checked)}
                    />
                    Chỉ hiện sách sắp hết ({lowStockBooks.length})
                </label>
            </div>

            <div className="inventory-table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Sách</th>
                            <th>Thể loại</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Nhập hàng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map((book) => {
                            const stockQuantity = book.stockQuantity || 0;
                            const status = getStockStatus(stockQuantity);

                            return (
                                <tr key={book._id || book.id} className={status.class}>
                                    <td>
                                        <div className="book-info-cell">
                                            <img src={book.image} alt={book.title} className="book-thumb-small" />
                                            <div>
                                                <div className="book-title-small">{book.title}</div>
                                                <div className="book-author-small">{book.author}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{book.category}</span>
                                    </td>
                                    <td>
                                        <span className="stock-quantity">{stockQuantity}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${status.class}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="restock-actions">
                                            <button onClick={() => handleRestock(book, 5)} className="btn-restock small">+5</button>
                                            <button onClick={() => handleRestock(book, 10)} className="btn-restock">+10</button>
                                            <button onClick={() => handleRestock(book, 20)} className="btn-restock">+20</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredBooks.length === 0 && (
                <div className="empty-state">
                    <p>Không tìm thấy sách nào</p>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
