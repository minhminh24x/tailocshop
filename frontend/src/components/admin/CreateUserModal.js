// File: frontend/src/components/admin/CreateUserModal.js
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createUser } from '../../services/adminUserService';
import { FaTimes } from 'react-icons/fa';

export default function CreateUserModal({ isOpen, onClose, onSuccess, defaultRole = 'STAFF' }) {
  const [inGameName, setInGameName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);

  // [SỬA] Không render gì nếu không mở
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser({ inGameName, email, role });
      toast.success('Tạo tài khoản thành công!');
      onSuccess?.();
      // Reset form
      setInGameName('');
      setEmail('');
      setRole(defaultRole);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setInGameName('');
      setEmail('');
      setRole(defaultRole);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div
        className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Tạo tài khoản mới</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên In-game */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tên In-game</label>
            <input
              type="text"
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              placeholder="VD: PlayerPro123"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              placeholder="email@example.com"
              required
            />
          </div>

          {/* Chức vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Chức vụ</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="STAFF">STAFF (Nhân viên)</option>
              <option value="SUPPLIER">SUPPLIER (Nhà cung cấp)</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-gray-300">
              📧 Mật khẩu tạm thời sẽ được tự động tạo và gửi đến email trên.
              Người dùng sẽ bị buộc đổi mật khẩu khi đăng nhập lần đầu.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}