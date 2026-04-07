import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { fetchMyOrders } from '../redux/ordersSlice';
import './Header.css';

const Header = () => {
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const cartQuantity = useSelector(state => state.cart.totalQuantity);
    const wishlistCount = useSelector(state => state.wishlist.wishlist?.length || 0);
    const orderCount = useSelector(state => state.orders.myOrders?.length || 0);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'admin') {
            dispatch(fetchMyOrders());
        }
    }, [dispatch, isAuthenticated, user?.role]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const closeMenus = () => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        closeMenus();
    };

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
                                    🎛️ Admin Panel
                                </NavLink>
                            </li>
                        )}
                        {/* ✅ THÀNH VIÊN 4: Ẩn Wishlist & Cart cho Admin */}
                        {user?.role !== 'admin' && (
                            <>
                                <li>
                                    <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                        Yêu thích
                                        {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/my-orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                        📦 Đơn hàng của tôi
                                        {orderCount > 0 && <span className="cart-badge">{orderCount}</span>}
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="nav-right">
                        {/* ✅ THÀNH VIÊN 4: Ẩn icon giỏ hàng cho Admin */}
                        {user?.role !== 'admin' && (
                            <Link to="/cart" className="cart-icon-wrapper">
                                <div className="cart-icon">
                                    🛒
                                    {cartQuantity > 0 && <span className="cart-count">{cartQuantity}</span>}
                                </div>
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="user-menu">
                                <div className="user-menu-trigger" onClick={toggleUserDropdown}>
                                    <span className="user-name">👤 {user.name}</span>
                                    <span className="dropdown-arrow">▼</span>
                                </div>
                                {isUserDropdownOpen && (
                                    <div className="user-dropdown">
                                        <button onClick={handleLogout} className="dropdown-item">
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-login">
                                Đăng nhập
                            </Link>
                        )}

                        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                            ☰
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="mobile-menu-overlay" onClick={closeMenus}>
                            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                                <div className="mobile-menu-header">
                                    <span className="mobile-menu-title">Menu</span>
                                    <button className="mobile-menu-close" onClick={closeMenus}>✕</button>
                                </div>
                                <ul className="mobile-nav-links">
                                    <li>
                                        <Link to="/" className="mobile-nav-link" onClick={closeMenus}>
                                            Trang chủ
                                        </Link>
                                    </li>
                                    {user?.role === 'admin' && (
                                        <li>
                                            <Link to="/admin/dashboard" className="mobile-nav-link" onClick={closeMenus}>
                                                🎛️ Admin Panel
                                            </Link>
                                        </li>
                                    )}
                                    {/* ✅ THÀNH VIÊN 4: Ẩn Wishlist & Cart cho Admin */}
                                    {user?.role !== 'admin' && (
                                        <>
                                            <li>
                                                <Link to="/wishlist" className="mobile-nav-link" onClick={closeMenus}>
                                                    Yêu thích
                                                    {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/my-orders" className="mobile-nav-link" onClick={closeMenus}>
                                                    📦 Đơn hàng của tôi
                                                    {orderCount > 0 && <span className="cart-badge">{orderCount}</span>}
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/cart" className="mobile-nav-link" onClick={closeMenus}>
                                                    🛒 Giỏ hàng
                                                    {cartQuantity > 0 && <span className="cart-badge">{cartQuantity}</span>}
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                    {isAuthenticated ? (
                                        <li>
                                            <button onClick={handleLogout} className="mobile-nav-link mobile-logout">
                                                Đăng xuất
                                            </button>
                                        </li>
                                    ) : (
                                        <li>
                                            <Link to="/login" className="mobile-nav-link" onClick={closeMenus}>
                                                Đăng nhập
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
