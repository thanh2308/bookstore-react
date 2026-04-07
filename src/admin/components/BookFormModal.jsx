import React, { useState } from 'react';
import { useToast } from '../../components/Toast';
import './BookFormModal.css';

const BookFormModal = ({ book, onSave, onClose }) => {
    const { error: showError } = useToast();
    const [formData, setFormData] = useState(book || {
        title: '',
        author: '',
        category: 'Kỹ năng sống',
        price: '',
        originalPrice: '',
        rating: 4.5,
        reviews: 0,
        description: '',
        image: '',
        isbn: '',
        stockQuantity: 0,
        inStock: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(book?.image || '');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showError('Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB');
                return;
            }

            // Keep File object for upload, and create preview
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            // Don't set image property yet, keep it for backend
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title || !formData.author || !formData.price || !formData.isbn || !formData.description) {
            showError('Vui lòng điền đầy đủ tất cả thông tin bắt buộc (*)');
            return;
        }

        if (!imageFile && !book && !formData.image) {
            showError('Vui lòng chọn ảnh sách');
            return;
        }

        const bookData = {
            ...formData,
            price: parseInt(formData.price),
            originalPrice: parseInt(formData.originalPrice) || 0,
            rating: parseFloat(formData.rating),
            stockQuantity: parseInt(formData.stockQuantity) || 0
        };

        // Gắn File object nếu có chọn ảnh mới
        if (imageFile) {
            bookData.image = imageFile;
        }

        onSave(bookData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="book-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{book ? '✏️ Sửa Sách' : '➕ Thêm Sách Mới'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="book-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tên sách *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tác giả *</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                required
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Thể loại *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input"
                            >
                                <option>Kỹ năng sống</option>
                                <option>Tiểu thuyết</option>
                                <option>Khoa học</option>
                                <option>Kinh tế</option>
                                <option>Thiếu nhi</option>
                                <option>Văn học Việt Nam</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Rating *</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Giá bán *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                                className="input"
                                placeholder="86000"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giá gốc</label>
                            <input
                                type="number"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                className="input"
                                placeholder="120000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>ISBN *</label>
                            <input
                                type="text"
                                value={formData.isbn}
                                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                required
                                className="input"
                                placeholder="978-604-2-12345-6"
                            />
                        </div>

                        <div className="form-group">
                            <label>Số lượng tồn kho</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.stockQuantity}
                                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                className="input"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mô tả *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Hình ảnh sách *</label>

                        <div className="image-upload-section">
                            <div className="image-input-group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="file-input"
                                    id="imageUpload"
                                />
                                <label htmlFor="imageUpload" className="file-label">
                                    📁 Chọn ảnh từ máy
                                </label>

                                <span className="or-divider">hoặc</span>

                                <input
                                    type="url"
                                    value={typeof formData.image === 'string' && !formData.image.startsWith('data:') ? formData.image : ''}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setFormData({ ...formData, image: url });
                                        setImagePreview(url);
                                        setImageFile(null);
                                    }}
                                    className="input"
                                    placeholder="Nhập URL hình ảnh"
                                />
                            </div>

                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, image: '' });
                                            setImagePreview('');
                                            setImageFile(null);
                                        }}
                                        className="btn-remove-image"
                                    >
                                        ✕ Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {book ? 'Cập Nhật' : 'Thêm Sách'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookFormModal;
