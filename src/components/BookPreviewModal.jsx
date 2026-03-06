import React from 'react';
import './BookPreviewModal.css';

const BookPreviewModal = ({ book, isOpen, onClose }) => {
    if (!isOpen) return null;

    // Mock preview pages - trong thực tế sẽ load từ server
    const previewPages = [
        book.image, // Cover
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop', // Page 1
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=800&fit=crop', // Page 2
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=800&fit=crop'  // Page 3
    ];

    const [currentPage, setCurrentPage] = React.useState(0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="preview-header">
                    <h2>{book.title}</h2>
                    <p>Tác giả: {book.author}</p>
                    <span className="preview-badge">Đọc thử miễn phí</span>
                </div>

                <div className="preview-content">
                    <img
                        src={previewPages[currentPage]}
                        alt={`Page ${currentPage + 1}`}
                        className="preview-page"
                    />
                </div>

                <div className="preview-controls">
                    <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="nav-btn"
                    >
                        ← Trang trước
                    </button>

                    <span className="page-indicator">
                        Trang {currentPage + 1} / {previewPages.length}
                    </span>

                    <button
                        onClick={() => setCurrentPage(Math.min(previewPages.length - 1, currentPage + 1))}
                        disabled={currentPage === previewPages.length - 1}
                        className="nav-btn"
                    >
                        Trang sau →
                    </button>
                </div>

                <div className="preview-footer">
                    <p>💡 Đọc thử {previewPages.length} trang đầu tiên. Mua sách để đọc toàn bộ!</p>
                </div>
            </div>
        </div>
    );
};

export default BookPreviewModal;
