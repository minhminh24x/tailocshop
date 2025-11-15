// File: frontend/src/pages/admin/manager/AdminManageUsers.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUsers } from '../../../services/adminUserService'; //
import CreateUserModal from '../../../components/admin/CreateUserModal'; //

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaffAndSuppliers = async () => {
    setLoading(true);
    try {
      // Chỉ lấy STAFF và SUPPLIER
      const data = await getUsers(['STAFF', 'SUPPLIER']);
      setUsers(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân sự');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndSuppliers();
  }, []);

  const handleUserCreated = () => {
    setIsModalOpen(false);
    fetchStaffAndSuppliers(); // Tải lại danh sách
    toast.success('Tạo tài khoản thành công!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Nhân sự</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tạo tài khoản mới
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto text-gray-900">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Tên In-game</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Chức vụ</th>
                <th className="p-4 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.inGameName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded ${
                      user.role === 'STAFF' ? 'bg-green-200 text-green-800' : 'bg-indigo-200 text-indigo-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
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