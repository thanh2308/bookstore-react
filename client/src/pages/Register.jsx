import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../redux/authSlice';
import { useToast } from '../components/Toast';
import './Auth.css';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { success, error: showToastError } = useToast();
    const { isAuthenticated, loading, error } = useSelector(state => state.auth);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Cho ô Mật khẩu
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Cho ô Xác nhận mật khẩu

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            success('Đăng ký thành công!');
            navigate('/');
        }
    }, [isAuthenticated, navigate, success]);

    useEffect(() => {
        if (error) {
            showToastError(error);
            dispatch(clearError());
        }
    }, [error, showToastError, dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setValidationError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreeTerms) {
            setValidationError('Bạn phải đồng ý với Điều khoản dịch vụ để tiếp tục');
            return;
        }

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setValidationError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        const { name, email, password } = formData;
        dispatch(registerUser({ name, email, password }));
    };

    const eyeButtonStyle = {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        zIndex: 1, 
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card">
                    <h1 className="auth-title">Đăng Ký</h1>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Họ và tên</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Nguyễn Văn A"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="example@email.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"} 
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    minLength="6"
                                    disabled={loading}
                                    style={{ width: '100%', paddingRight: '40px' }} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={eyeButtonStyle}
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            {/* Bọc input bằng div relative */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"} 
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    minLength="6"
                                    disabled={loading}
                                    style={{ width: '100%', paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={eyeButtonStyle}
                                >
                                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                disabled={loading}
                                style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="terms" style={{ margin: 0, cursor: 'pointer', fontSize: '14px' }}>
                                Tôi đồng ý với <Link to="/terms" style={{ color: '#007bff' }}>Điều khoản dịch vụ</Link>
                            </label>
                        </div>

                        {validationError && (
                            <div className="error-message">{validationError}</div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary auth-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
