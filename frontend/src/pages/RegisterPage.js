// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// [KHÔI PHỤC] Import useAuthStore
import { useAuthStore } from '../store/authStore.js';
// [XÓA] Xóa 'shallow'
// import { shallow } from 'zustand/shallow'; 

export default function RegisterPage() {
  
  // [ĐÃ SỬA] Tách 3 hook riêng biệt
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inGameName, setInGameName] = useState('');
  
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    
    const success = await register({ email, password, inGameName });

    if (success) {
      setSuccessMsg('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setEmail('');
      setPassword('');
      setInGameName('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Đăng Ký</h2>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
            <p>{successMsg}</p>
          </div>
        )}

        <div className="mb-4">
          <label
            className="block text-gray-300 text-sm font-bold mb-2"
            htmlFor="inGameName"
          >
            Tên trong game (In-Game Name)
          </label>
          <input
            type="text"
            id="inGameName"
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}