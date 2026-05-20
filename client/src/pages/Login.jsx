import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../redux/authSlice";
import { useToast } from "../components/Toast";
import AppIcon from "../components/AppIcon";
import "./Auth.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success, error: showToastError } = useToast();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      success("Đăng nhập thành công!");
      navigate("/");
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
      [e.target.name]: e.target.value,
    };
    setFormData(nextFormData);
    setFieldErrors(validateLogin(nextFormData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateLogin(formData);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    dispatch(loginUser(formData));
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-shell">
          <aside className="auth-quote-panel" aria-label="BookStore">
            <span>BookStore</span>
            <h1>Một tài khoản cho mọi kệ sách bạn đang theo đuổi.</h1>
            <p>Đăng nhập để lưu wishlist, theo dõi đơn hàng và nhận gợi ý đọc phù hợp hơn.</p>
          </aside>

          <div className="auth-card">
          <h1 className="auth-title">Đăng nhập</h1>

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
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && <p className="field-error" id="email-error">{fieldErrors.email}</p>}
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
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <AppIcon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
              {fieldErrors.password && <p className="field-error" id="password-error">{fieldErrors.password}</p>}
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input type="checkbox" name="remember" />
                <span>Nhớ tôi</span>
              </label>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="auth-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>

          </div>
        </div>
      </div>
    </div>
  );
};

const validateLogin = (values) => {
  const errors = {};
  if (!values.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Email không hợp lệ";
  }
  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (values.password.length < 6) {
    errors.password = "Mật khẩu tối thiểu 6 ký tự";
  }
  return errors;
};

export default Login;
