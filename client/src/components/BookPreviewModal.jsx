import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../services/api';
import AppIcon from './AppIcon';
import './BookPreviewModal.css';

const BookPreviewModal = ({ book, isOpen, onClose }) => {
    const [currentPage, setCurrentPage] = useState(0);

    if (!isOpen) return null;

    const previewPages = [
        getOptimizedImageUrl(book.coverImage || book.image, "w_700,f_auto,q_auto"),
        ...(book.gallery || []).map((image) => getOptimizedImageUrl(image, "w_700,f_auto,q_auto")),
    ].filter(Boolean);
    const pages = previewPages.length > 0 ? previewPages : [""];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Đóng xem nhanh"><AppIcon name="x" size={18} /></button>

                <div className="preview-header">
                    <h2>{book.title}</h2>
                    <p>Tác giả: {book.author}</p>
                    <span className="preview-badge">Xem nhanh</span>
                </div>

                <div className="preview-content">
                    <img
                        src={pages[currentPage]}
                        alt={book.title}
                        className="preview-page"
                    />
                </div>

                <div className="preview-controls">
                    <button
                        className="nav-btn prev"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                    >
                        <span className="icon"><AppIcon name="chevronLeft" size={17} /></span>
                        Trang trước
                    </button>

                    <span className="page-indicator">
                        Trang {currentPage + 1} / {pages.length}
                    </span>

                    <button
                        className="nav-btn next"
                        onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                        disabled={currentPage === pages.length - 1}
                    >
                        Trang sau
                        <span className="icon"><AppIcon name="chevronRight" size={17} /></span>
                    </button>
                </div>

                <div className="preview-footer">
                    <p>Xem nhanh bìa và thông tin sách trước khi mở trang chi tiết.</p>
                </div>
            </div>
        </div>
    );
};

export default BookPreviewModal;
