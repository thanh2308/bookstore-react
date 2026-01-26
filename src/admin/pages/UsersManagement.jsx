import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleUserStatus, updateUserRole } from '../../redux/usersSlice';
import { useToast } from '../../components/Toast';
import './UsersManagement.css';

const UsersManagement = () => {
    const dispatch = useDispatch();
    const { success } = useToast();
    const users = useSelector(state => state.users.users);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = (userId, userName) => {
        dispatch(toggleUserStatus(userId));
        success(`Đã cập nhật trạng thái user ${userName}!`);
    };

    const handleRoleChange = (userId, newRole, userName) => {
        dispatch(updateUserRole({ userId, role: newRole }));
        success(`Đã cập nhật quyền ${userName} thành ${newRole}!`);
    };

    return (
        <div className="users-management">
            <h1>👥 Quản Lý Người Dùng</h1>

            <div className="users-stats">
                <div className="stat-card-small">
                    <span className="stat-icon">👥</span>
                    <div>
                        <p>Tổng Users</p>
                        <h3>{users.length}</h3>
                    </div>
                </div>
                <div className="stat-card-small">
                    <span className="stat-icon">✅</span>
                    <div>
                        <p>Active</p>
                        <h3>{users.filter(u => u.status === 'active').length}</h3>
                    </div>
                </div>
                <div className="stat-card-small">
                    <span className="stat-icon">🛡️</span>
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
                            <th>Ngày Tham Gia</th>
                            <th>Đơn Hàng</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="user-name-cell">{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value, user.name)}
                                        className="role-select"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`status-pill ${user.status === 'active' ? 'active' : 'blocked'}`}>
                                        {user.status === 'active' ? '✓ Active' : '✕ Blocked'}
                                    </span>
                                </td>
                                <td>{user.joinDate}</td>
                                <td className="orders-count">{user.totalOrders}</td>
                                <td>
                                    <button
                                        onClick={() => handleToggleStatus(user.id, user.name)}
                                        className={`btn-toggle ${user.status === 'active' ? 'btn-block' : 'btn-unblock'}`}
                                    >
                                        {user.status === 'active' ? '🚫 Block' : '✅ Unblock'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManagement;
