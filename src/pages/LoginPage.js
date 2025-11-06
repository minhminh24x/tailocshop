// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// [ĐÃ XÓA] Xóa import useAuthStore và shallow
// import { useAuthStore } from '../store/authStore.js';
// import { shallow } from 'zustand/shallow'; 

export default function LoginPage() {
  
  // [ĐÃ XÓA] Xóa logic gọi useAuthStore
  // const { login, isLoading, error } = useAuthStore(...)

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // [ĐÃ XÓA] Xóa useNavigate vì không dùng
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // [ĐÃ SỬA] Vô hiệu hóa logic, chỉ log ra console
    console.log('Chức năng đăng nhập đã bị tắt (chế độ tĩnh).');
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Đăng Nhập
        </h2>

        { /* [ĐÃ XÓA] Xóa hiển thị lỗi */ }

        <div className="mb-4">
          <label
            className="block text-gray-300 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-300 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          // [ĐÃ SỬA] Xóa 'disabled'
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          { /* [ĐÃ SỬA] Xóa text 'isLoading' */ }
          Đăng Nhập
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}