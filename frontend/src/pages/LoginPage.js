// frontend/src/pages/LoginPage.js

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      // Gọi hàm login từ store
      const redirectPath = await login({ email, password });

      // [MỚI] Kiểm tra role - chỉ CUSTOMER mới được đăng nhập tại đây
      const user = useAuthStore.getState().user;

      if (user && user.role !== 'CUSTOMER') {
        // Logout và thông báo lỗi
        const logout = useAuthStore.getState().logout;
        logout();

        if (user.role === 'ADMIN') {
          toast.error('Admin vui lòng đăng nhập tại /admin/login');
        } else {
          toast.error('Staff/Supplier vui lòng đăng nhập tại /staff/login');
        }
        return;
      }

      if (redirectPath) {
        const from = location.state?.from?.pathname;
        if (redirectPath === '/' && from) {
          navigate(from);
        } else {
          navigate(redirectPath);
        }
      }

    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Đăng Nhập</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {/* [MỚI] Link quên mật khẩu */}
          <p>
            <Link to="/forgot-password" className="text-gray-400 hover:text-pink-400 text-sm">
              Quên mật khẩu?
            </Link>
          </p>
          <p className="text-gray-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-pink-400 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}