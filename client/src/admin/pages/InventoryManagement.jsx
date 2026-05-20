import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, updateBook } from '../../redux/booksSlice';
import { useToast } from '../../components/Toast';
import { getOptimizedImageUrl } from '../../services/api';
import AppIcon from '../../components/AppIcon';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const dispatch = useDispatch();
    const { success, error: showError } = useToast();
    const allBooks = useSelector(state => state.books?.allBooks || []);
    const loading = useSelector(state => state.books.loading);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [editingStockId, setEditingStockId] = useState(null);
    const [editingStockValue, setEditingStockValue] = useState('');

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

    const handleSaveStock = async (book) => {
        const nextQuantity = Number(editingStockValue);
        if (!Number.isFinite(nextQuantity) || nextQuantity < 0) {
            showError('Số lượng tồn kho không hợp lệ');
            return;
        }
        try {
            await dispatch(updateBook({ id: book._id || book.id, bookData: { stockQuantity: nextQuantity } })).unwrap();
            success(`Đã cập nhật tồn kho "${book.title}"`);
            setEditingStockId(null);
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
            <h1><AppIcon name="package" size={28} /> Quản Lý Kho Hàng</h1>

            {loading && (
                <div className="admin-table-skeleton" aria-label="Đang tải kho hàng">
                    {[1, 2, 3, 4].map((item) => <span className="skeleton admin-row-skeleton" key={item} />)}
                </div>
            )}

            {lowStockBooks.length > 0 && (
                <div className="alert-banner warning">
                    <span className="alert-icon"><AppIcon name="alert" size={24} /></span>
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
                            <th>Cover</th>
                            <th>Sách</th>
                            <th>SKU</th>
                            <th>Thể loại</th>
                            <th>Tồn kho</th>
                            <th>Ngưỡng cảnh báo</th>
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
                                        <img src={getOptimizedImageUrl(book.coverImage || book.image, "w_120,f_auto,q_auto")} alt={book.title} className="book-thumb-small" />
                                    </td>
                                    <td>
                                        <div>
                                            <div className="book-title-small">{book.title}</div>
                                            <div className="book-author-small">{book.author}</div>
                                        </div>
                                    </td>
                                    <td>{book.isbn || book._id?.slice(-8) || 'N/A'}</td>
                                    <td>
                                        <span className="category-badge">{book.category}</span>
                                    </td>
                                    <td>
                                        {editingStockId === (book._id || book.id) ? (
                                            <input
                                                className="stock-inline-input"
                                                type="number"
                                                min="0"
                                                value={editingStockValue}
                                                onChange={(event) => setEditingStockValue(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') handleSaveStock(book);
                                                    if (event.key === 'Escape') setEditingStockId(null);
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="stock-quantity"
                                                onClick={() => {
                                                    setEditingStockId(book._id || book.id);
                                                    setEditingStockValue(String(stockQuantity));
                                                }}
                                            >
                                                {stockQuantity}
                                            </button>
                                        )}
                                    </td>
                                    <td>{LOW_STOCK_THRESHOLD} cuốn</td>
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
