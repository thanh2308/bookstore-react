import React, { useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import AdminSidebar from './components/AdminSidebar';
import AppIcon from '../components/AppIcon';
import './AdminLayout.css';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(state => state.auth.user);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const allBooks = useSelector(state => state.books.allBooks);
    const allOrders = useSelector(state => state.orders.allOrders);

    const breadcrumb = useMemo(() => {
        const labelMap = {
            dashboard: 'Dashboard',
            books: 'Sách',
            orders: 'Đơn hàng',
            users: 'Người dùng',
            analytics: 'Phân tích',
            inventory: 'Kho hàng',
            promotions: 'Khuyến mãi',
        };
        const current = location.pathname.split('/').filter(Boolean).at(-1);
        return labelMap[current] || 'Dashboard';
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
                onLogout={handleLogout}
                user={user}
                bookCount={allBooks.length}
                pendingOrderCount={allOrders.filter((order) => order.status === 'pending').length}
            />

            <div className="admin-main">
                <header className="admin-header">
                    <div className="admin-breadcrumb">
                        <span>Admin</span>
                        <AppIcon name="chevronRight" size={15} />
                        <strong>{breadcrumb}</strong>
                    </div>
                    <div className="admin-user-menu">
                        <button type="button" className="admin-notification" aria-label="Thông báo">
                            <AppIcon name="bell" size={18} />
                            {allOrders.some((order) => order.status === 'pending') && <span />}
                        </button>
                        <Link to="/admin/books" className="admin-quick-action">
                            <AppIcon name="plus" size={16} /> Thêm sách
                        </Link>
                        <span className="admin-user-name"><AppIcon name="user" size={17} /> {user?.name}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
