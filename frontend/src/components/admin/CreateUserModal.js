// File: frontend/src/components/admin/CreateUserModal.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createUser } from '../../services/adminUserService';

export default function CreateUserModal({ onClose, onUserCreated }) {
  const [inGameName, setInGameName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser({ inGameName, email, role });
      onUserCreated();
    } catch (error) {
      toast.error(error.message || 'Tạo tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Tạo tài khoản mới</h2>
        <form onSubmit={handleSubmit}>
          {/* Tên In-game */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên In-game</label>
            <input
              type="text"
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          {/* Chức vụ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="STAFF">STAFF (Nhân viên)</option>
              <option value="SUPPLIER">SUPPLIER (Nhà cung cấp)</option>
            </select>
          </div>
          {/* Ghi chú */}
          <p className="text-sm text-gray-600 mb-4">
            Mật khẩu tạm thời sẽ được tự động tạo và gửi đến email trên.
            Người dùng sẽ bị buộc đổi mật khẩu khi đăng nhập lần đầu.
          </p>
          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}