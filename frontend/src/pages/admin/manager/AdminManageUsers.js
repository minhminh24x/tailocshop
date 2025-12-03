// File: frontend/src/pages/admin/manager/AdminManageUsers.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; // [FIX] Dùng react-hot-toast cho nhất quán
import { getUsers } from '../../../services/adminUserService';
import CreateUserModal from '../../../components/admin/CreateUserModal';

export default function AdminManageUsers({ type = 'STAFF' }) { // [FIX] Thêm prop type ('STAFF' | 'CUSTOMER')
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Xác định title và roles dựa trên type
  const isCustomerMode = type === 'CUSTOMER';
  const pageTitle = isCustomerMode ? 'Quản lý Khách hàng' : 'Quản lý Nhân sự';
  const rolesToFetch = isCustomerMode ? ['CUSTOMER'] : ['STAFF', 'SUPPLIER']; // 'CUSTOMER' là role đúng trong schema

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(rolesToFetch);
      setUsers(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]); // Reload khi type thay đổi

  const handleUserCreated = () => {
    setIsModalOpen(false);
    fetchUsers();
    toast.success('Tạo tài khoản thành công!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
        {!isCustomerMode && ( // Chỉ cho phép tạo Staff/Supplier, Customer tự đăng ký
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition duration-200"
          >
            + Tạo tài khoản mới
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-300">Đang tải...</p>
      ) : (
        <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-left">Tên In-game</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Chức vụ</th>
                <th className="p-4 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="p-4">{user.inGameName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-900 text-red-200' :
                      user.role === 'STAFF' ? 'bg-green-900 text-green-200' :
                        user.role === 'SUPPLIER' ? 'bg-blue-900 text-blue-200' :
                          'bg-gray-700 text-gray-300'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">Không tìm thấy người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CreateUserModal
          onClose={() => setIsModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
}