import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { fetchMyOrders } from '../redux/ordersSlice';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

const Header = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { isDark, toggleTheme } = useTheme();

    const cartQuantity = useSelector(state => state.cart.totalQuantity);
    const wishlistCount = useSelector(state => state.wishlist.wishlist?.length || 0);
    const orderCount = useSelector(state => state.orders.myOrders?.length || 0);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    // Fetch orders khi login
    useEffect(() => {
        if (isAuthenticated && user?.role !== 'admin') {
            dispatch(fetchMyOrders());
        }
    }, [dispatch, isAuthenticated, user?.role]);

    // Đóng menu khi đổi trang
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
    }, [location.pathname]);

    // Khóa scroll body khi mobile menu mở
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const toggleUserDropdown = () => setIsUserDropdownOpen(prev => !prev);

    const closeMenus = () => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        closeMenus();
    };

    const isAdmin = user?.role === 'admin';
    const avatarLetter = user?.name?.[0]?.toUpperCase() || '?';

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    {/* ── Logo ── */}
                    <Link to="/" className="logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">BookStore</span>
                    </Link>

                    {/* ── Desktop nav links ── */}
                    <ul className="nav-links">
                        <li>
                            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Trang chủ
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/ai" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                🤖 BookAI
                            </NavLink>
                        </li>
                        {isAdmin && (
                            <li>
                                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                    🎛️ Admin Panel
                                </NavLink>
                            </li>
                        )}
                        {!isAdmin && (
                            <>
                                <li>
                                    <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                        Yêu thích
                                        {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/my-orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                        📦 Đơn hàng
                                        {orderCount > 0 && <span className="nav-badge">{orderCount}</span>}
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* ── Desktop right actions ── */}
                    <div className="nav-right">
                        {/* ── Theme Toggle ── */}
                        <button
                            className={`theme-toggle-btn${isDark ? ' is-dark' : ''}`}
                            onClick={toggleTheme}
                            aria-label={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
                            title={isDark ? 'Light Mode' : 'Dark Mode'}
                        >
                            <div className="theme-toggle-track">
                                <span className="theme-toggle-thumb">
                                    {isDark ? '🌙' : '☀️'}
                                </span>
                            </div>
                        </button>

                        {!isAdmin && (
                            <Link to="/cart" className="cart-icon-wrapper" aria-label="Giỏ hàng">
                                <div className="cart-icon">
                                    🛒
                                    {cartQuantity > 0 && <span className="cart-count">{cartQuantity}</span>}
                                </div>
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="user-menu" ref={dropdownRef}>
                                <button
                                    className="user-menu-trigger"
                                    onClick={toggleUserDropdown}
                                    aria-expanded={isUserDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="user-avatar">{avatarLetter}</div>
                                    <span className="user-name">{user.name}</span>
                                    <span className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`}>▼</span>
                                </button>

                                {isUserDropdownOpen && (
                                    <div className="user-dropdown" role="menu">
                                        <div className="dropdown-header">
                                            <div className="dropdown-avatar">{avatarLetter}</div>
                                            <div>
                                                <div className="dropdown-name">{user.name}</div>
                                                <div className="dropdown-email">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link to="/profile" className="dropdown-item" onClick={closeMenus} role="menuitem">
                                            👤 Thông tin cá nhân
                                        </Link>
                                        {!isAdmin && (
                                            <Link to="/my-orders" className="dropdown-item" onClick={closeMenus} role="menuitem">
                                                📦 Đơn hàng của tôi
                                            </Link>
                                        )}
                                        <div className="dropdown-divider" />
                                        <button onClick={handleLogout} className="dropdown-item dropdown-logout" role="menuitem">
                                            🚪 Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-login">
                                Đăng nhập
                            </Link>
                        )}

                        {/* ── Hamburger button ── */}
                        <button
                            className={`hamburger-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
                            onClick={toggleMobileMenu}
                            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="hamburger-line" />
                            <span className="hamburger-line" />
                            <span className="hamburger-line" />
                        </button>
                    </div>

                    {/* ── Mobile drawer overlay ── */}
                    <div
                        className={`mobile-overlay ${isMobileMenuOpen ? 'visible' : ''}`}
                        onClick={closeMenus}
                        aria-hidden="true"
                    />

                    {/* ── Mobile drawer panel ── */}
                    <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`} role="dialog" aria-label="Navigation menu">
                        {/* Drawer header */}
                        <div className="drawer-header">
                            <Link to="/" className="drawer-logo" onClick={closeMenus}>
                                <span>📚</span>
                                <span>BookStore</span>
                            </Link>
                            <button className="drawer-close-btn" onClick={closeMenus} aria-label="Đóng menu">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* User info block (if logged in) */}
                        {isAuthenticated && (
                            <div className="drawer-user-info">
                                <div className="drawer-avatar">{avatarLetter}</div>
                                <div>
                                    <div className="drawer-user-name">{user.name}</div>
                                    <div className="drawer-user-email">{user.email}</div>
                                </div>
                            </div>
                        )}

                        {/* Nav links */}
                        <nav className="drawer-nav">
                            <Link to="/" className="drawer-link" onClick={closeMenus}>
                                <span className="drawer-link-icon">🏠</span>
                                Trang chủ
                            </Link>

                            <Link to="/ai" className="drawer-link" onClick={closeMenus}>
                                <span className="drawer-link-icon">🤖</span>
                                BookAI
                            </Link>

                            {/* Theme Toggle in Drawer */}
                            <button className="drawer-link" onClick={toggleTheme} style={{ justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="drawer-link-icon">{isDark ? '🌙' : '☀️'}</span>
                                    {isDark ? 'Dark Mode' : 'Light Mode'}
                                </span>
                                <span className={`theme-toggle-btn${isDark ? ' is-dark' : ''}`} style={{ pointerEvents: 'none', flexShrink: 0 }}>
                                    <span className="theme-toggle-track">
                                        <span className="theme-toggle-thumb">{isDark ? '🌙' : '☀️'}</span>
                                    </span>
                                </span>
                            </button>

                            {isAdmin ? (
                                <Link to="/admin/dashboard" className="drawer-link" onClick={closeMenus}>
                                    <span className="drawer-link-icon">🎛️</span>
                                    Admin Panel
                                </Link>
                            ) : (
                                <>
                                    <Link to="/wishlist" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon">❤️</span>
                                        Yêu thích
                                        {wishlistCount > 0 && <span className="drawer-badge">{wishlistCount}</span>}
                                    </Link>
                                    <Link to="/my-orders" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon">📦</span>
                                        Đơn hàng của tôi
                                        {orderCount > 0 && <span className="drawer-badge">{orderCount}</span>}
                                    </Link>
                                    <Link to="/cart" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon">🛒</span>
                                        Giỏ hàng
                                        {cartQuantity > 0 && <span className="drawer-badge">{cartQuantity}</span>}
                                    </Link>
                                </>
                            )}

                            {isAuthenticated ? (
                                <>
                                    <div className="drawer-divider" />
                                    <Link to="/profile" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon">👤</span>
                                        Thông tin cá nhân
                                    </Link>
                                    <button className="drawer-link drawer-logout" onClick={handleLogout}>
                                        <span className="drawer-link-icon">🚪</span>
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="drawer-divider" />
                                    <Link to="/login" className="drawer-link drawer-login-link" onClick={closeMenus}>
                                        Đăng nhập
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;