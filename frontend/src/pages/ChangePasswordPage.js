// File: frontend/src/pages/ChangePasswordPage.js
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, ArrowLeft, Eye, EyeOff, Check, X, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { changePassword } from '../services/userService';

// Password requirements component
function PasswordRequirements({ password }) {
    const requirements = [
        { label: 'Ít nhất 8 ký tự', test: (pw) => pw.length >= 8 },
        { label: 'Chữ hoa (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
        { label: 'Chữ thường (a-z)', test: (pw) => /[a-z]/.test(pw) },
        { label: 'Số (0-9)', test: (pw) => /[0-9]/.test(pw) },
        { label: 'Ký tự đặc biệt (!@#$...)', test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
    ];

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                Yêu cầu mật khẩu mạnh
            </h4>
            <ul className="space-y-2">
                {requirements.map((req, idx) => {
                    const passed = password ? req.test(password) : false;
                    return (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                            {passed ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <X className="w-4 h-4 text-gray-500" />
                            )}
                            <span className={passed ? 'text-green-400' : 'text-gray-500'}>
                                {req.label}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function ChangePasswordPage() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    // [SỬA] Redirect if not logged in - dùng user thay vì isAuthenticated
    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePassword = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('Ít nhất 8 ký tự');
        if (!/[A-Z]/.test(password)) errors.push('Cần chữ HOA');
        if (!/[a-z]/.test(password)) errors.push('Cần chữ thường');
        if (!/[0-9]/.test(password)) errors.push('Cần số');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Cần ký tự đặc biệt');
        return errors;
    };

    // Redirect based on role after password change
    const getRedirectPath = () => {
        switch (user?.role) {
            case 'ADMIN': return '/admin/dashboard';
            case 'STAFF': return '/staff/dashboard';
            case 'SUPPLIER': return '/supplier/dashboard';
            default: return '/profile';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { currentPassword, newPassword, confirmPassword } = formData;

        // Validate
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận không khớp!');
            return;
        }

        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            toast.error(`Mật khẩu yếu: ${passwordErrors.join(', ')}`);
            return;
        }

        try {
            setIsLoading(true);
            await changePassword({
                oldPassword: currentPassword,
                newPassword: newPassword,
            });

            // [MỚI] Cập nhật user trong store để clear mustChangePassword
            const fetchProfile = useAuthStore.getState().fetchProfile;
            if (fetchProfile) {
                await fetchProfile();
            }

            toast.success('Đổi mật khẩu thành công!');
            navigate(getRedirectPath());
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <Link to="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Quay lại hồ sơ
            </Link>

            <div className="glass-panel p-8 rounded-2xl border border-purple-500/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Đổi Mật Khẩu</h1>
                    <p className="text-gray-400 mt-2">
                        Tài khoản: <strong className="text-yellow-400">{user?.inGameName}</strong>
                    </p>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                    <p className="text-yellow-400 text-sm flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Lưu ý:</strong> KHÔNG sử dụng mật khẩu trùng với mật khẩu trong game KingMC!
                        </span>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mật khẩu hiện tại *
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 pr-12"
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mật khẩu mới *
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 pr-12"
                                placeholder="Nhập mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <PasswordRequirements password={formData.newPassword} />

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Xác nhận mật khẩu mới *
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 pr-12"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xử lý...' : '🔐 Đổi Mật Khẩu'}
                    </button>
                </form>

                {/* Forgot Password Link */}
                <div className="mt-6 text-center">
                    <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                        Quên mật khẩu hiện tại?
                    </Link>
                </div>
            </div>
        </div>
    );
}
