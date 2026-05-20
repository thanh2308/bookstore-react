import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
import userService from '../../services/userService';
import AppIcon from '../../components/AppIcon';
import './UsersManagement.css';

const UsersManagement = () => {
    const { success, error: showError } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingBlockUser, setPendingBlockUser] = useState(null);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const data = await userService.getUsers({ limit: 100 });
                setUsers(data.users || []);
            } catch (error) {
                showError(error.message || 'Không tải được danh sách người dùng');
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [showError]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const keyword = searchTerm.toLowerCase();
            return name.includes(keyword) || email.includes(keyword);
        });
    }, [users, searchTerm]);

    const handleRoleChange = async (userId, newRole, userName) => {
        try {
            const data = await userService.updateUser(userId, { role: newRole });
            setUsers(prev => prev.map(user => user._id === userId ? { ...user, role: data.user.role } : user));
            success(`Đã cập nhật quyền ${userName} thành ${newRole}!`);
        } catch (error) {
            showError(error.message || 'Không cập nhật được quyền');
        }
    };

    const handleToggleStatus = async (userId, userName) => {
        try {
            const data = await userService.toggleUserBlock(userId);
            setUsers(prev => prev.map(user => user._id === userId ? { ...user, isBlocked: data.user.isBlocked } : user));
            success(`Đã cập nhật trạng thái user ${userName}!`);
        } catch (error) {
            showError(error.message || 'Không cập nhật được trạng thái');
        }
    };

    if (loading) {
        return (
            <div className="users-management">
                <div className="admin-table-skeleton" aria-label="Đang tải người dùng">
                    {[1, 2, 3, 4].map((item) => <span className="skeleton admin-row-skeleton" key={item} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="users-management">
            <h1><AppIcon name="users" size={28} /> Quản Lý Người Dùng</h1>

            <div className="users-stats">
                <div className="stat-card-small">
                    <span className="stat-icon"><AppIcon name="users" size={22} /></span>
                    <div>
                        <p>Tổng Users</p>
                        <h3>{users.length}</h3>
                    </div>
                </div>
                <div className="stat-card-small">
                    <span className="stat-icon"><AppIcon name="checkCircle" size={22} /></span>
                    <div>
                        <p>Đang hoạt động</p>
                        <h3>{users.filter(u => !u.isBlocked).length}</h3>
                    </div>
                </div>
                <div className="stat-card-small">
                    <span className="stat-icon"><AppIcon name="shield" size={22} /></span>
                    <div>
                        <p>Admins</p>
                        <h3>{users.filter(u => u.role === 'admin').length}</h3>
                    </div>
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm user theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-admin"
                />
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Quyền</th>
                            <th>Trạng Thái</th>
                            <th>Ngày Tạo</th>
                            <th>Đơn Hàng</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td className="user-name-cell">{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value, user.name)}
                                        className="role-select"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`status-pill ${user.isBlocked ? 'blocked' : 'active'}`}>
                                        {user.isBlocked ? <><AppIcon name="x" size={14} /> Blocked</> : <><AppIcon name="check" size={14} /> Active</>}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="orders-count">{user.orderHistory?.length || 0}</td>
                                <td>
                                    <button
                                        onClick={() => setPendingBlockUser(user)}
                                        className={`btn-toggle ${user.isBlocked ? 'btn-unblock' : 'btn-block'}`}
                                    >
                                        {user.isBlocked ? <><AppIcon name="checkCircle" size={15} /> Unblock</> : <><AppIcon name="x" size={15} /> Block</>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pendingBlockUser && (
                <div className="admin-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="block-user-title">
                    <div className="admin-confirm-modal">
                        <h2 id="block-user-title">{pendingBlockUser.isBlocked ? 'Mở khóa user?' : 'Block user?'}</h2>
                        <p>{pendingBlockUser.name} sẽ được cập nhật trạng thái ngay trong hệ thống.</p>
                        <label className="block-reason-label">
                            Lý do
                            <textarea placeholder="Nhập lý do nội bộ..." />
                        </label>
                        <div className="admin-confirm-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setPendingBlockUser(null)}>Hủy</button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => {
                                    handleToggleStatus(pendingBlockUser._id, pendingBlockUser.name);
                                    setPendingBlockUser(null);
                                }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
