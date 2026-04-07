import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
import promotionService from '../../services/promotionService';
import './PromotionsManagement.css';

const PromotionsManagement = () => {
    const { success, error: showError } = useToast();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const categories = ['Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Kinh tế', 'Thiếu nhi', 'Văn học Việt Nam'];

    const emptyForm = {
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 0,
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        applicableCategories: []
    };

    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        const loadPromotions = async () => {
            setLoading(true);
            try {
                const data = await promotionService.getPromotions(false);
                setPromotions(data.promotions || []);
            } catch (error) {
                showError(error.message || 'Không tải được khuyến mãi');
            } finally {
                setLoading(false);
            }
        };

        loadPromotions();
    }, [showError]);

    const handleAddNew = () => {
        setEditingPromotion(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            code: promotion.code || '',
            description: promotion.description || '',
            discountType: promotion.discountType || 'percentage',
            discountValue: promotion.discountValue || 10,
            minOrderValue: promotion.minOrderValue || 0,
            maxDiscount: promotion.maxDiscount ?? '',
            startDate: promotion.startDate ? String(promotion.startDate).slice(0, 10) : '',
            endDate: promotion.endDate ? String(promotion.endDate).slice(0, 10) : '',
            usageLimit: promotion.usageLimit ?? '',
            applicableCategories: promotion.applicableCategories || []
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            code: formData.code.toUpperCase(),
            description: formData.description,
            discountType: formData.discountType,
            discountValue: Number(formData.discountValue),
            minOrderValue: Number(formData.minOrderValue),
            maxDiscount: formData.maxDiscount === '' ? undefined : Number(formData.maxDiscount),
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            usageLimit: formData.usageLimit === '' ? undefined : Number(formData.usageLimit),
            applicableCategories: formData.applicableCategories
        };

        try {
            if (editingPromotion) {
                const data = await promotionService.updatePromotion(editingPromotion._id, payload);
                setPromotions(prev => prev.map(item => item._id === editingPromotion._id ? data.promotion : item));
                success('Đã cập nhật khuyến mãi!');
            } else {
                const data = await promotionService.createPromotion(payload);
                setPromotions(prev => [data.promotion, ...prev]);
                success('Đã tạo khuyến mãi mới!');
            }
            setShowModal(false);
        } catch (error) {
            showError(error.message || 'Không lưu được khuyến mãi');
        }
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`Xóa khuyến mãi "${code}"?`)) {
            return;
        }

        try {
            await promotionService.deletePromotion(id);
            setPromotions(prev => prev.filter(item => item._id !== id));
            success('Đã xóa khuyến mãi!');
        } catch (error) {
            showError(error.message || 'Không xóa được khuyến mãi');
        }
    };

    const handleToggle = async (promotion) => {
        try {
            const data = await promotionService.updatePromotion(promotion._id, {
                isActive: !promotion.isActive
            });
            setPromotions(prev => prev.map(item => item._id === promotion._id ? data.promotion : item));
            success('Đã cập nhật trạng thái!');
        } catch (error) {
            showError(error.message || 'Không cập nhật được trạng thái');
        }
    };

    const promoCount = useMemo(() => promotions.length, [promotions]);

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải khuyến mãi...</p>
            </div>
        );
    }

    return (
        <div className="promotions-management">
            <div className="page-header">
                <h1>🎉 Quản Lý Khuyến Mãi</h1>
                <button onClick={handleAddNew} className="btn btn-primary">
                    ➕ Tạo Khuyến Mãi Mới
                </button>
            </div>

            <p style={{ marginBottom: '1rem' }}>Tổng khuyến mãi: {promoCount}</p>

            <div className="promotions-grid">
                {promotions.map((promo) => (
                    <div key={promo._id} className={`promo-card ${promo.isActive ? 'active' : 'inactive'}`}>
                        <div className="promo-header">
                            <h3>{promo.code}</h3>
                            <button
                                onClick={() => handleToggle(promo)}
                                className={`toggle-btn ${promo.isActive ? 'on' : 'off'}`}
                            >
                                {promo.isActive ? '✓ Đang chạy' : '✕ Tắt'}
                            </button>
                        </div>

                        <div className="promo-details">
                            <div className="promo-info">
                                <span className="label">Mô tả:</span>
                                <span className="value discount">{promo.description}</span>
                            </div>

                            <div className="promo-info">
                                <span className="label">Giảm:</span>
                                <span className="value">{promo.discountValue}{promo.discountType === 'percentage' ? '%' : '₫'}</span>
                            </div>

                            <div className="promo-info">
                                <span className="label">Đơn tối thiểu:</span>
                                <span className="value">{Number(promo.minOrderValue || 0).toLocaleString()}₫</span>
                            </div>

                            <div className="promo-info">
                                <span className="label">Từ:</span>
                                <span className="value">{String(promo.startDate).slice(0, 10)}</span>
                            </div>

                            <div className="promo-info">
                                <span className="label">Đến:</span>
                                <span className="value">{String(promo.endDate).slice(0, 10)}</span>
                            </div>

                            <div className="promo-categories">
                                {(promo.applicableCategories || []).map((cat) => (
                                    <span key={cat} className="category-tag">{cat}</span>
                                ))}
                            </div>
                        </div>

                        <div className="promo-actions">
                            <button onClick={() => handleEdit(promo)} className="btn-edit-promo">
                                ✏️ Sửa
                            </button>
                            <button onClick={() => handleDelete(promo._id, promo.code)} className="btn-delete-promo">
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
                                <label>Mã khuyến mãi *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    className="input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả *</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                <label>Loại giảm giá *</label>
                                <select
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    className="input"
                                >
                                    <option value="percentage">Phần trăm</option>
                                    <option value="fixed">Số tiền cố định</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Giá trị giảm *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    required
                                    className="input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Đơn hàng tối thiểu</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.minOrderValue}
                                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                    className="input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Giảm tối đa (chỉ phần trăm)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    className="input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Giới hạn lượt dùng</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
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
                                                checked={formData.applicableCategories.includes(cat)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, applicableCategories: [...formData.applicableCategories, cat] });
                                                    } else {
                                                        setFormData({ ...formData, applicableCategories: formData.applicableCategories.filter(item => item !== cat) });
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
