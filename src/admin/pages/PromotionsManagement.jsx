import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPromotion, updatePromotion, deletePromotion, togglePromotionActive } from '../../redux/promotionsSlice';
import { useToast } from '../../components/Toast';
import './PromotionsManagement.css';

const PromotionsManagement = () => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const promotions = useSelector(state => state.promotions.promotions);
    const allBooks = useSelector(state => state.books.allBooks);
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const categories = ['Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Kinh tế', 'Thiếu nhi', 'Văn học Việt Nam'];

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        discountRate: 0,
        categories: []
    });

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setFormData(promotion);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingPromotion(null);
        setFormData({ name: '', startDate: '', endDate: '', discountRate: 0, categories: [] });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPromotion) {
            dispatch(updatePromotion({ ...formData, id: editingPromotion.id }));
            success('Đã cập nhật khuyến mãi!');
        } else {
            dispatch(addPromotion(formData));
            success('Đã tạo khuyến mãi mới!');
        }
        setShowModal(false);
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Xóa khuyến mãi "${name}"?`)) {
            dispatch(deletePromotion(id));
            success('Đã xóa khuyến mãi!');
        }
    };

    const handleToggle = (id) => {
        dispatch(togglePromotionActive(id));
        success('Đã cập nhật trạng thái!');
    };

    const getAffectedBooks = (promotion) => {
        return allBooks.filter(book => promotion.categories.includes(book.category)).length;
    };

    return (
        <div className="promotions-management">
            <div className="page-header">
                <h1>🎉 Quản Lý Khuyến Mãi</h1>
                <button onClick={handleAddNew} className="btn btn-primary">
                    ➕ Tạo Khuyến Mãi Mới
                </button>
            </div>

            <div className="promotions-grid">
                {promotions.map((promo) => (
                    <div key={promo.id} className={`promo-card ${promo.isActive ? 'active' : 'inactive'}`}>
                        <div className="promo-header">
                            <h3>{promo.name}</h3>
                            <button
                                onClick={() => handleToggle(promo.id)}
                                className={`toggle-btn ${promo.isActive ? 'on' : 'off'}`}
                            >
                                {promo.isActive ? '✓ Đang chạy' : '✕ Tắt'}
                            </button>
                        </div>

                        <div className="promo-details">
                            <div className="promo-info">
                                <span className="label">Giảm giá:</span>
                                <span className="value discount">{(promo.discountRate * 100).toFixed(0)}%</span>
                            </div>

                            <div className="promo-info">
                                <span className="label">Từ:</span>
                                <span className="value">{promo.startDate}</span>
                            </div>

                            <div className="promo-info">
                                <span className="label">Đến:</span>
                                <span className="value">{promo.endDate}</span>
                            </div>

                            <div className="promo-categories">
                                {promo.categories.map((cat, idx) => (
                                    <span key={idx} className="category-tag">{cat}</span>
                                ))}
                            </div>

                            <div className="promo-stats">
                                📚 {getAffectedBooks(promo)} sách áp dụng
                            </div>
                        </div>

                        <div className="promo-actions">
                            <button onClick={() => handleEdit(promo)} className="btn-edit-promo">
                                ✏️ Sửa
                            </button>
                            <button onClick={() => handleDelete(promo.id, promo.name)} className="btn-delete-promo">
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingPromotion ? '✏️ Sửa Khuyến Mãi' : '➕ Tạo Khuyến Mãi'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="promo-form">
                            <div className="form-group">
                                <label>Tên khuyến mãi *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="input"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày bắt đầu *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ngày kết thúc *</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Giảm giá (%) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={formData.discountRate * 100}
                                    onChange={(e) => setFormData({ ...formData, discountRate: parseFloat(e.target.value) / 100 })}
                                    required
                                    className="input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Thể loại áp dụng *</label>
                                <div className="categories-checkboxes">
                                    {categories.map((cat) => (
                                        <label key={cat} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.categories.includes(cat)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, categories: [...formData.categories, cat] });
                                                    } else {
                                                        setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) });
                                                    }
                                                }}
                                            />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingPromotion ? 'Cập Nhật' : 'Tạo Khuyến Mãi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionsManagement;
