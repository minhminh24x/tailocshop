// File: frontend/src/pages/admin/AdminHeader.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js'; // Import store

export default function AdminHeader() {
  // Lấy thông tin user và hàm logout từ Zustand
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <Link to="/admin" className="text-xl font-bold text-pink-500 hover:text-pink-400 transition-colors">
        Tài Lộc Shop - Admin Panel
      </Link>

      <div className="flex items-center space-x-4">
        {/* Quay về trang chủ (public) */}
        <Link
          to="/"
          className="text-sm text-gray-300 hover:text-pink-400 transition-colors"
          title="Quay về trang chủ"
        >
          🏠 Về Shop
        </Link>

        {/* Hiển thị thông tin Admin */}
        {user && (
          <span className="text-green-400 font-medium">
            Xin chào, {user.inGameName}
          </span>
        )}

        {/* Nút Đăng xuất */}
        <button
          onClick={() => logout()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 text-sm shadow-md"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}