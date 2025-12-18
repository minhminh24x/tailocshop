// File: frontend/src/pages/admin/AdminLoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import logoImg from '../../logo.png';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useAuthStore(); // [FIX] Lấy user từ store
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsLoading(true);
        try {
            // login() trả về path (string), không phải user object
            const redirectPath = await login({ email, password });

            // [FIX] Lấy user từ store sau khi login
            const currentUser = useAuthStore.getState().user;

            if (currentUser) {
                const userRole = currentUser.role;

                // [SỬA] Chỉ cho phép ADMIN đăng nhập tại đây
                if (userRole !== 'ADMIN') {
                    // Logout và hướng dẫn đến đúng trang
                    useAuthStore.getState().logout();

                    if (userRole === 'CUSTOMER') {
                        toast.error('Khách hàng vui lòng đăng nhập tại /login');
                    } else {
                        toast.error('Staff/Supplier vui lòng đăng nhập tại /staff/login');
                    }
                    return;
                }

                toast.success(`Đăng nhập thành công! Xin chào ${currentUser.inGameName}`);
                navigate('/admin/dashboard');
            }
        } catch (error) {
            toast.error(error.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-yellow-500/30 rounded-full blur-lg group-hover:bg-yellow-500/50 transition-all"></div>
                            <img src={logoImg} alt="TaiLocShop Logo" className="relative h-14 w-14 object-contain rounded-xl" />
                        </div>
                        <div className="text-left">
                            <span className="text-3xl font-black text-white">Tài Lộc <span className="text-yellow-400">Shop</span></span>
                            <p className="text-xs text-gray-400 tracking-wider">ADMIN PORTAL</p>
                        </div>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <h1 className="text-2xl font-bold text-white">Đăng nhập Quản trị</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="admin@tailocshop.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Đăng nhập
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-center text-gray-400 text-sm">
                            Trang dành cho nhân viên và quản trị viên
                        </p>
                        <div className="mt-4 flex justify-center gap-4 text-sm">
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                                ← Đăng nhập khách hàng
                            </Link>
                            <Link to="/forgot-password" className="text-gray-400 hover:text-white transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2024 Tài Lộc Shop. All rights reserved.
                </p>
            </div>
        </div>
    );
}
