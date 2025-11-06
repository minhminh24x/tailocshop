// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { shallow } from 'zustand/shallow'; // <-- 1. TÔI ĐÃ IMPORT DÒNG NÀY

export default function LoginPage() {
  // 2. TÔI ĐÃ THÊM 'shallow'
  const { login, isLoading, error } = useAuthStore(
    (state) => ({
      login: state.login,
      isLoading: state.isLoading,
      error: state.error,
    }),
    shallow // <-- 3. TÔI ĐÃ THÊM VÀO ĐÂY
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const success = await login({ email, password });

    if (success) {
      navigate('/');
    }
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

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang tải...' : 'Đăng Nhập'}
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