import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { fetchMyOrders } from '../redux/ordersSlice';
import { useTheme } from '../contexts/ThemeContext';
import AppIcon from './AppIcon';
import './Header.css';

const Header = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const { isDark, toggleTheme } = useTheme();

    const cartQuantity = useSelector(state => state.cart.totalQuantity);
    const wishlistCount = useSelector(state => state.wishlist.wishlist?.length || 0);
    const orderCount = useSelector(state => state.orders.myOrders?.length || 0);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        const handleScroll = () => setHasScrolled(window.scrollY > 60);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
        setIsSearchOpen(false);
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

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const query = searchTerm.trim();
        if (query) {
            navigate(`/?search=${encodeURIComponent(query)}`);
        }
    };

    const isAdmin = user?.role === 'admin';
    const avatarLetter = user?.name?.[0]?.toUpperCase() || '?';

    return (
        <header className={`header ${hasScrolled ? "is-scrolled" : ""}`}>
            <div className="container">
                <nav className="navbar">
                    {/* ── Logo ── */}
                    <Link to="/" className="logo">
                        <span className="logo-icon"><AppIcon name="book" size={22} /></span>
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
                                AI Chat
                            </NavLink>
                        </li>
                        {isAdmin && (
                            <li>
                                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                    <AppIcon name="dashboard" size={16} /> Admin Panel
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
                                        <AppIcon name="package" size={16} /> Đơn hàng
                                        {orderCount > 0 && <span className="nav-badge">{orderCount}</span>}
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* ── Desktop right actions ── */}
                    <div className="nav-right">
                        {/* ── Theme Toggle ── */}
                        <form className={`header-search ${isSearchOpen ? "is-open" : ""}`} onSubmit={handleSearchSubmit}>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Tìm sách, tác giả..."
                                aria-label="Tìm kiếm sách"
                            />
                            <button
                                type={isSearchOpen ? "submit" : "button"}
                                onClick={() => setIsSearchOpen(true)}
                                aria-label="Mở tìm kiếm"
                            >
                                <AppIcon name="search" size={18} />
                            </button>
                        </form>

                        <button
                            className={`theme-toggle-btn header-theme-toggle${isDark ? ' is-dark' : ''}`}
                            onClick={toggleTheme}
                            aria-label={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
                            title={isDark ? 'Light Mode' : 'Dark Mode'}
                        >
                            <div className="theme-toggle-track">
                                <span className="theme-toggle-thumb">
                                    <AppIcon name={isDark ? 'moon' : 'sun'} size={13} />
                                </span>
                            </div>
                        </button>

                        {!isAdmin && (
                            <Link to="/cart" className="cart-icon-wrapper" aria-label="Giỏ hàng">
                                <div className="cart-icon">
                                    <AppIcon name="cart" size={24} />
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
                                    <AppIcon name="chevronDown" size={14} className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`} />
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
                                            <AppIcon name="user" size={16} /> Thông tin cá nhân
                                        </Link>
                                        {!isAdmin && (
                                            <Link to="/my-orders" className="dropdown-item" onClick={closeMenus} role="menuitem">
                                                <AppIcon name="package" size={16} /> Đơn hàng của tôi
                                            </Link>
                                        )}
                                        <div className="dropdown-divider" />
                                        <button onClick={handleLogout} className="dropdown-item dropdown-logout" role="menuitem">
                                            <AppIcon name="logout" size={16} /> Đăng xuất
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
                    <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
                        {/* Drawer header */}
                        <div className="drawer-header">
                            <Link to="/" className="drawer-logo" onClick={closeMenus}>
                                <AppIcon name="book" size={20} />
                                <span>BookStore</span>
                            </Link>
                            <button className="drawer-close-btn" onClick={closeMenus} aria-label="Đóng menu">
                                <AppIcon name="x" size={20} strokeWidth={2.5} />
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
                                <span className="drawer-link-icon"><AppIcon name="home" size={18} /></span>
                                Trang chủ
                            </Link>

                            <Link to="/ai" className="drawer-link" onClick={closeMenus}>
                                <span className="drawer-link-icon"><AppIcon name="bot" size={18} /></span>
                                AI Chat
                            </Link>

                            {/* Theme Toggle in Drawer */}
                            <button className="drawer-link drawer-theme-row" onClick={toggleTheme}>
                                <span className="drawer-theme-label">
                                    <span className="drawer-link-icon"><AppIcon name={isDark ? 'moon' : 'sun'} size={18} /></span>
                                    {isDark ? 'Dark Mode' : 'Light Mode'}
                                </span>
                                <span className={`theme-toggle-btn drawer-theme-toggle${isDark ? ' is-dark' : ''}`} aria-hidden="true">
                                    <span className="theme-toggle-track">
                                        <span className="theme-toggle-thumb"><AppIcon name={isDark ? 'moon' : 'sun'} size={13} /></span>
                                    </span>
                                </span>
                            </button>

                            {isAdmin ? (
                                <Link to="/admin/dashboard" className="drawer-link" onClick={closeMenus}>
                                    <span className="drawer-link-icon"><AppIcon name="dashboard" size={18} /></span>
                                    Admin Panel
                                </Link>
                            ) : (
                                <>
                                    <Link to="/wishlist" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon"><AppIcon name="heart" size={18} /></span>
                                        Yêu thích
                                        {wishlistCount > 0 && <span className="drawer-badge">{wishlistCount}</span>}
                                    </Link>
                                    <Link to="/my-orders" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon"><AppIcon name="package" size={18} /></span>
                                        Đơn hàng của tôi
                                        {orderCount > 0 && <span className="drawer-badge">{orderCount}</span>}
                                    </Link>
                                    <Link to="/cart" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon"><AppIcon name="cart" size={18} /></span>
                                        Giỏ hàng
                                        {cartQuantity > 0 && <span className="drawer-badge">{cartQuantity}</span>}
                                    </Link>
                                </>
                            )}

                            {isAuthenticated ? (
                                <>
                                    <div className="drawer-divider" />
                                    <Link to="/profile" className="drawer-link" onClick={closeMenus}>
                                        <span className="drawer-link-icon"><AppIcon name="user" size={18} /></span>
                                        Thông tin cá nhân
                                    </Link>
                                    <button className="drawer-link drawer-logout" onClick={handleLogout}>
                                        <span className="drawer-link-icon"><AppIcon name="logout" size={18} /></span>
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
