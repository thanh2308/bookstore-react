import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    // Giữ nguyên logic Redux lấy user
    const { user } = useSelector(state => state.auth);
    
    // Giữ nguyên logic quản lý tab
    const [activeTab, setActiveTab] = useState('info');

    // Giữ nguyên logic Form Thông tin
    const [infoForm, setInfoForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Giữ nguyên logic Form Mật khẩu
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Giữ nguyên hàm xử lý submit
    const handleInfoSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu cập nhật:", infoForm);
        alert('Cập nhật thông tin thành công!');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if(passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        alert('Đổi mật khẩu thành công!');
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-layout">
                    
                    {/* 📌 Cột Trái: Sidebar Chi Tiết (Thiết kế kế thừa từ image_7.png nhưng Tab dọc là VIÊN THUỐC) */}
                    <div className="profile-sidebar">
                        <div className="profile-avatar-banner">
                            {/* Banner ảnh phụ giống image_7.png */}
                            <div className="avatar-banner-bg" style={{ backgroundImage: 'linear-gradient(135deg, #a5b4fc 0%, #eef2ff 100%)' }}></div>
                            <div className="avatar-container">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=100`} alt="Avatar" />
                                <div className="avatar-info">
                                    <h3>{user?.name || 'Khách hàng'}</h3>
                                    <p className="avatar-title">Thành viên thân thiết</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Thêm phần Stats giống image_7.png (Dữ liệu test) */}
                        <div className="profile-stats">
                            <div className="stat-card">
                                <h4>3</h4>
                                <p>Đơn hàng</p>
                            </div>
                            <div className="stat-card">
                                <h4>10</h4>
                                <p>Đánh giá</p>
                            </div>
                            <div className="stat-card">
                                <h4>5k</h4>
                                <p>Điểm</p>
                            </div>
                        </div>

                        {/* 👉 Menu Tab dọc (Bo góc TRÒN tối đa giống category-tab trang Home) */}
                        <div className="profile-tabs-vertical">
                            <button 
                                className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('info')}
                            >
                                Thông tin cá nhân
                            </button>
                            <button 
                                className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('password')}
                            >
                                Đổi mật khẩu
                            </button>
                            <button 
                                className={`profile-tab ${activeTab === 'address' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('address')}
                            >
                                Sổ địa chỉ
                            </button>
                            <Link to="/my-orders" className="profile-tab link-tab">
                                Lịch sử mua hàng
                            </Link>
                        </div>
                    </div>

                    {/* 📌 Cột Phải: Nội Dung (Dạng Card gọn gàng, kế thừa từ image_7.png) */}
                    <div className="profile-main-content">
                        
                        {activeTab === 'info' && (
                            <div className="tab-pane fade-in">
                                <div className="content-card">
                                    <div className="content-card-header">
                                        <div className="header-info">
                                            <h2>👤 Thông Tin Cá Nhân</h2>
                                            <p className="subtitle">Cập nhật hồ sơ của bạn</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleInfoSubmit} className="custom-form">
                                        <div className="form-group">
                                            <label>Họ và tên</label>
                                            <input type="text" className="custom-input" value={infoForm.name} onChange={(e) => setInfoForm({...infoForm, name: e.target.value})} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Email (Không thể thay đổi)</label>
                                            <input type="email" className="custom-input" value={infoForm.email} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label>Số điện thoại</label>
                                            <input type="text" className="custom-input" value={infoForm.phone} onChange={(e) => setInfoForm({...infoForm, phone: e.target.value})} placeholder="Nhập số điện thoại..." />
                                        </div>
                                        {/* 👉 Nút submit là VIÊN THUỐC giống nút Đăng Nhập/Đăng Ký */}
                                        <button type="submit" className="btn-gradient">Lưu Thay Đổi</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="tab-pane fade-in">
                                <div className="content-card">
                                    <div className="content-card-header">
                                        <div className="header-info">
                                            <h2>🔒 Đổi Mật Khẩu</h2>
                                            <p className="subtitle">Bảo mật tài khoản</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handlePasswordSubmit} className="custom-form">
                                        <div className="form-group">
                                            <label>Mật khẩu hiện tại</label>
                                            <input type="password" className="custom-input" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Mật khẩu mới</label>
                                            <input type="password" className="custom-input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} minLength="6" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Xác nhận mật khẩu mới</label>
                                            <input type="password" className="custom-input" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} minLength="6" required />
                                        </div>
                                        {/* 👉 Nút submit là VIÊN THUỐC */}
                                        <button type="submit" className="btn-gradient">Cập Nhật Mật Khẩu</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="tab-pane fade-in">
                                <div className="content-card address-content-card">
                                    <div className="books-header-row card-header-with-title">
                                        <h2>📍 Sổ Địa Chỉ (1)</h2>
                                    </div>
                                    <div className="address-card">
                                        <div className="address-info">
                                            <p><strong>{user?.name || 'Nguyễn Văn A'}</strong> | 0123456789</p>
                                            <p>12/34 Đường số 5, Phường 6, Quận Gò Vấp, TP.HCM</p>
                                        </div>
                                        {/* 👉 Tag là bo góc tròn */}
                                        <span className="badge-gradient">Mặc định</span>
                                    </div>
                                    <button className="btn-outline-gradient">+ Thêm địa chỉ mới</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;