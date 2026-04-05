import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../redux/authSlice';
import { useToast } from '../components/Toast';
import './Auth.css';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { success, error: showToastError } = useToast();
    const { isAuthenticated, loading, error } = useSelector(state => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            success('Đăng nhập thành công!');
            navigate('/');a
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginUser(formData));
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card">
                    <h1 className="auth-title">Đăng Nhập</h1>

                    <form onSubmit={handleSubmit} className="auth-form">
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
                            <div style={{ display: 'flex', position: 'relative' }}>
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
                                    style={{ width: '100%' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>

                    <div className="auth-hint">
                        <small>💡 Tip: Sử dụng email có chứa "admin" để đăng nhập với quyền admin</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
