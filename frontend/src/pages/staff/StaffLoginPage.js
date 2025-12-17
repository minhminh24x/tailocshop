// File: frontend/src/pages/staff/StaffLoginPage.js
// Trang đăng nhập cho Staff, Supplier, Manager

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Users, LogIn } from 'lucide-react';

export default function StaffLoginPage() {
    const navigate = useNavigate();
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
            const redirectPath = await login({ email, password });

            // Kiểm tra role để điều hướng
            const user = useAuthStore.getState().user;

            if (!user) {
                toast.error('Đăng nhập thất bại');
                return;
            }

            // Chỉ cho phép STAFF, SUPPLIER, ADMIN đăng nhập tại đây
            if (user.role === 'CUSTOMER') {
                toast.error('Tài khoản khách hàng không thể đăng nhập tại đây. Vui lòng dùng trang /login');
                useAuthStore.getState().logout();
                return;
            }

            // Điều hướng theo role
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (user.role === 'STAFF') {
                navigate('/staff/dashboard');
            } else if (user.role === 'SUPPLIER') {
                navigate('/supplier/dashboard');
            }

        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Đăng Nhập Quản Lý</h2>
                    <p className="text-gray-400 mt-2">Dành cho Staff, Supplier, Manager</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            placeholder="staff@tailocshop.com"
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
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-white"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-200 disabled:opacity-50"
                    >
                        <LogIn className="w-5 h-5" />
                        {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-3">
                    <p className="text-gray-500 text-sm">
                        Bạn là khách hàng?{' '}
                        <Link to="/login" className="text-blue-400 hover:underline">
                            Đăng nhập tại đây
                        </Link>
                    </p>
                    <p className="text-gray-500 text-sm">
                        Quản trị viên?{' '}
                        <Link to="/admin/login" className="text-purple-400 hover:underline">
                            Admin Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
