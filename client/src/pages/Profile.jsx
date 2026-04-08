import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateProfile, changePassword } from '../redux/authSlice';
import { useToast } from '../components/Toast';
import './Profile.css';

const Profile = () => {
    const dispatch = useDispatch();
    const { success, error } = useToast();
    const { user, loading } = useSelector(state => state.auth);
    
    const [activeTab, setActiveTab] = useState('info');

    const [infoForm, setInfoForm] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: ''
    });

    useEffect(() => {
        if (user) {
            setInfoForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile(infoForm)).unwrap();
            success('Cập nhật thông tin thành công!');
        } catch (err) {
            error(err || 'Không thể cập nhật thông tin');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            error('Mật khẩu xác nhận không khớp!');
            return;
        }
        try {
            await dispatch(changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            })).unwrap();
            success('Đổi mật khẩu thành công!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            error(err || 'Đổi mật khẩu thất bại');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile({ newAddress: addressForm })).unwrap();
            success('Thêm địa chỉ thành công!');
            setShowAddressForm(false);
            setAddressForm({ fullName: '', phone: '', address: '', city: '' });
        } catch (err) {
            error(err || 'Không thể thêm địa chỉ');
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            error('Trình duyệt của bạn không hỗ trợ định vị GPS');
            return;
        }

        setIsLocating(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.state || data.address.province || '';
                        const parts = [
                            data.address.house_number,
                            data.address.road,
                            data.address.suburb || data.address.village,
                            data.address.county || data.address.city_district
                        ].filter(Boolean); 
                        
                        const detailedAddress = parts.join(', ');

                        setAddressForm(prev => ({
                            ...prev,
                            address: detailedAddress,
                            city: city
                        }));
                        success('Đã lấy được vị trí của bạn!');
                    }
                } catch (err) {
                    error('Lỗi khi phân tích địa chỉ từ tọa độ');
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                error('Bạn đã từ chối cấp quyền vị trí hoặc có lỗi xảy ra');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const avatarUrl = user?.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=120`;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-layout">
                    
                    <div className="profile-sidebar">
                        <div className="profile-avatar-banner">
                            <div className="avatar-banner-bg"></div>
                            
                            <div className="avatar-container">
                                <img src={avatarUrl} alt="Avatar" />
                                <div className="avatar-info">
                                    <h3>{user?.name}</h3>
                                    <p className="avatar-title">
                                        {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên thân thiết'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="profile-stats">
                            <div className="stat-card">
                                <h4>{user?.orderHistory?.length || 0}</h4>
                                <p>Đơn hàng</p>
                            </div>
                            <div className="stat-card">
                                <h4>{user?.wishlist?.length || 0}</h4>
                                <p>Yêu thích</p>
                            </div>
                            <div className="stat-card">
                                <h4>{user?.loyaltyPoints || 0}</h4>
                                <p>Điểm</p>
                            </div>
                        </div>

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
                                Sổ địa chỉ ({user?.addresses?.length || 0})
                            </button>
                            <Link to="/my-orders" className="profile-tab link-tab">
                                Lịch sử mua hàng
                            </Link>
                        </div>
                    </div>

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
                                            <input 
                                                type="text" 
                                                className="custom-input" 
                                                value={infoForm.name} 
                                                onChange={(e) => setInfoForm({...infoForm, name: e.target.value})} 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email (Không thể thay đổi)</label>
                                            <input type="email" className="custom-input" value={infoForm.email} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label>Số điện thoại</label>
                                            <input 
                                                type="text" 
                                                className="custom-input" 
                                                value={infoForm.phone} 
                                                onChange={(e) => setInfoForm({...infoForm, phone: e.target.value})} 
                                                placeholder="Nhập số điện thoại..." 
                                                disabled={loading}
                                            />
                                        </div>
                                        <button type="submit" className="btn-gradient" disabled={loading}>
                                            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                        </button>
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
                                            <input 
                                                type="password" 
                                                className="custom-input" 
                                                value={passwordForm.currentPassword} 
                                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Mật khẩu mới</label>
                                            <input 
                                                type="password" 
                                                className="custom-input" 
                                                value={passwordForm.newPassword} 
                                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                                                minLength="6" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Xác nhận mật khẩu mới</label>
                                            <input 
                                                type="password" 
                                                className="custom-input" 
                                                value={passwordForm.confirmPassword} 
                                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                                                minLength="6" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        <button type="submit" className="btn-gradient" disabled={loading}>
                                            {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="tab-pane fade-in">
                                <div className="content-card address-content-card">
                                    <div className="content-card-header">
                                        <h2>📍 Sổ Địa Chỉ</h2>
                                    </div>
                                    
                                    {user?.addresses?.length > 0 ? (
                                        user.addresses.map((addr, index) => (
                                            <div key={index} className="address-card" style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px' }}>
                                                <div className="address-info">
                                                    <p><strong>{addr.fullName || user.name}</strong> | {addr.phone || user.phone}</p>
                                                    <p>{addr.address}, {addr.city}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="address-card" style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px' }}>
                                            <div className="address-info">
                                                <p>Chưa có địa chỉ nào được lưu.</p>
                                            </div>
                                        </div>
                                    )}

                                    {showAddressForm ? (
                                        <form onSubmit={handleAddressSubmit} className="custom-form" style={{ marginTop: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <h4 style={{ margin: 0 }}>Thêm địa chỉ nhận hàng</h4>
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={handleGetLocation}
                                                    disabled={isLocating}
                                                    style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #34d399', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
                                                >
                                                    {isLocating ? '⏳ Đang định vị...' : '📍 Lấy vị trí hiện tại'}
                                                </button>
                                            </div>

                                            <div className="form-group">
                                                <label>Họ và tên người nhận</label>
                                                <input 
                                                    type="text" 
                                                    className="custom-input" 
                                                    value={addressForm.fullName} 
                                                    onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})} 
                                                    required 
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Số điện thoại</label>
                                                <input 
                                                    type="text" 
                                                    className="custom-input" 
                                                    value={addressForm.phone} 
                                                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} 
                                                    required 
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Địa chỉ chi tiết (Số nhà, tên đường...)</label>
                                                <input 
                                                    type="text" 
                                                    className="custom-input" 
                                                    value={addressForm.address} 
                                                    onChange={(e) => setAddressForm({...addressForm, address: e.target.value})} 
                                                    required 
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Tỉnh/Thành phố</label>
                                                <input 
                                                    type="text" 
                                                    className="custom-input" 
                                                    value={addressForm.city} 
                                                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} 
                                                    required 
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="submit" className="btn-gradient" disabled={loading}>
                                                    {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                                                </button>
                                                <button type="button" className="btn-outline-gradient" onClick={() => setShowAddressForm(false)} disabled={loading}>
                                                    Hủy
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button className="btn-outline-gradient" style={{ marginTop: '15px' }} onClick={() => setShowAddressForm(true)}>
                                            + Thêm địa chỉ mới
                                        </button>
                                    )}
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