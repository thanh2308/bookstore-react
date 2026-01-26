import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../redux/authSlice';
import './Auth.css';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Demo login - không validate thật
        const name = formData.email.split('@')[0];
        dispatch(login({ email: formData.email, name }));
        navigate('/');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1>Đăng Nhập</h1>
                    <p className="auth-subtitle">Chào mừng bạn trở lại!</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="input"
                                placeholder="example@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary auth-submit">
                            Đăng Nhập
                        </button>
                    </form>

                    <p className="auth-footer">
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
