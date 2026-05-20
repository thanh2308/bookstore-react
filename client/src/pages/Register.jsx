import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../redux/authSlice';
import { useToast } from '../components/Toast';
import AppIcon from '../components/AppIcon';
import './Auth.css';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { success, error: showToastError } = useToast();
    const { isAuthenticated, loading, error } = useSelector(state => state.auth);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});

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
        const nextFormData = {
            ...formData,
            [e.target.name]: e.target.value
        };
        setFormData(nextFormData);
        setFieldErrors(validateRegister(nextFormData, agreeTerms));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validateRegister(formData, agreeTerms);
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const { name, email, password } = formData;
        dispatch(registerUser({ name, email, password }));
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-shell">
                    <aside className="auth-quote-panel" aria-label="BookStore">
                        <span>BookStore</span>
                        <h1>Bắt đầu một hồ sơ đọc có gu và có lịch sử rõ ràng.</h1>
                        <p>Lưu sách yêu thích, theo dõi đơn hàng và để BookStore ghi nhớ những gì bạn quan tâm.</p>
                    </aside>

                    <div className="auth-card">
                    <h1 className="auth-title">Đăng ký</h1>

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
                                aria-invalid={Boolean(fieldErrors.name)}
                                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                            />
                            {fieldErrors.name && <p className="field-error" id="name-error">{fieldErrors.name}</p>}
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
                                aria-invalid={Boolean(fieldErrors.email)}
                                aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
                            />
                            {fieldErrors.email && <p className="field-error" id="register-email-error">{fieldErrors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-field">
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
                                    aria-invalid={Boolean(fieldErrors.password)}
                                    aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    <AppIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                                </button>
                            </div>
                            {fieldErrors.password && <p className="field-error" id="register-password-error">{fieldErrors.password}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <div className="password-field">
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
                                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                    aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="password-toggle"
                                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                                >
                                    <AppIcon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={18} />
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && <p className="field-error" id="confirm-password-error">{fieldErrors.confirmPassword}</p>}
                        </div>

                        <div className="form-group">
                            <label className="auth-checkbox">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreeTerms}
                                onChange={(e) => {
                                    setAgreeTerms(e.target.checked);
                                    setFieldErrors(validateRegister(formData, e.target.checked));
                                }}
                                disabled={loading}
                            />
                            <span>
                                Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link>
                            </span>
                            </label>
                            {fieldErrors.terms && <p className="field-error">{fieldErrors.terms}</p>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const validateRegister = (values, agreeTerms) => {
    const errors = {};
    if (!values.name.trim()) errors.name = 'Vui lòng nhập họ tên';
    if (!values.email.trim()) {
        errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Email không hợp lệ';
    }
    if (!values.password) {
        errors.password = 'Vui lòng nhập mật khẩu';
    } else if (values.password.length < 6) {
        errors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    if (values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!agreeTerms) errors.terms = 'Bạn cần đồng ý điều khoản để tiếp tục';
    return errors;
};

export default Register;
