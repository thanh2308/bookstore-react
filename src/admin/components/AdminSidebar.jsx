import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/analytics', icon: '📈', label: 'Phân tích' },
        { path: '/admin/books', icon: '📚', label: 'Quản lý Sách' },
        { path: '/admin/inventory', icon: '📦', label: 'Kho hàng' },
        { path: '/admin/orders', icon: '🛒', label: 'Đơn hàng' },
        { path: '/admin/promotions', icon: '🎉', label: 'Khuyến mãi' },
        { path: '/admin/users', icon: '👥', label: 'Người dùng' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h1>📚 Admin Panel</h1>
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
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;

