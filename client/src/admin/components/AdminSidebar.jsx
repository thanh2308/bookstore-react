import React from 'react';
import { NavLink } from 'react-router-dom';
import AppIcon from '../../components/AppIcon';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, onToggleCollapse, onLogout, user, bookCount = 0, pendingOrderCount = 0 }) => {
    const menuItems = [
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/admin/books', icon: 'book', label: 'Sách', badge: bookCount > 0 ? bookCount : null },
        { path: '/admin/orders', icon: 'cart', label: 'Đơn hàng', badge: pendingOrderCount > 0 ? pendingOrderCount : null },
        { path: '/admin/users', icon: 'users', label: 'Người dùng' },
        { path: '/admin/analytics', icon: 'analytics', label: 'Phân tích' },
        { path: '/admin/inventory', icon: 'package', label: 'Kho hàng' },
        { path: '/admin/promotions', icon: 'gift', label: 'Khuyến mãi' },
    ];

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
            <div className="sidebar-header">
                <h1><AppIcon name="book" size={24} /> <span>BookStore</span></h1>
                <button
                    type="button"
                    className="sidebar-collapse-btn"
                    onClick={onToggleCollapse}
                    aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                >
                    <AppIcon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} size={17} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="sidebar-icon"><AppIcon name={item.icon} size={20} /></span>
                        <span className="sidebar-label">{item.label}</span>
                        {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-admin-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                <div className="sidebar-admin-info">
                    <strong>{user?.name || 'Admin'}</strong>
                    <span>{user?.email || 'admin@pageturn.vn'}</span>
                </div>
                <button type="button" className="sidebar-logout" onClick={onLogout} aria-label="Đăng xuất">
                    <AppIcon name="logout" size={18} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;

