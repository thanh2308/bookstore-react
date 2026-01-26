import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import './Header.css';

const Header = () => {
    const dispatch = useDispatch();
    const cartQuantity = useSelector(state => state.cart.totalQuantity);
    const wishlistCount = useSelector(state => state.wishlist.items.length);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <Link to="/" className="logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">BookStore</span>
                    </Link>

                    <ul className="nav-links">
                        <li>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Trang chủ
                            </NavLink>
                        </li>
                        {user?.role === 'admin' && (
                            <li>
                                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                    🎛️ Admin
                                </NavLink>
                            </li>
                        )}
                        <li>
                            <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Yêu thích
                                {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Giỏ hàng
                                {cartQuantity > 0 && <span className="cart-badge">{cartQuantity}</span>}
                            </NavLink>
                        </li>
                    </ul>

                    <div className="nav-right">
                        <Link to="/cart" className="cart-icon-wrapper">
                            <div className="cart-icon">
                                🛒
                                {cartQuantity > 0 && <span className="cart-count">{cartQuantity}</span>}
                            </div>
                        </Link>

                        {isAuthenticated ? (
                            <div className="user-menu">
                                <span className="user-name">👤 {user.name}</span>
                                <button onClick={() => dispatch(logout())} className="btn-logout">
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-login">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
