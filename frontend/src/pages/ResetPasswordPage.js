// File: frontend/src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword, verifyResetToken } from '../services/authService';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [userName, setUserName] = useState('');

    // Kiểm tra token khi component mount
    useEffect(() => {
        const checkToken = async () => {
            if (!token || !email) {
                setIsVerifying(false);
                setIsTokenValid(false);
                return;
            }

            try {
                const { data } = await verifyResetToken(token, email);
                setIsTokenValid(data.valid);
                setUserName(data.inGameName || '');
            } catch (error) {
                setIsTokenValid(false);
            } finally {
                setIsVerifying(false);
            }
        };

        checkToken();
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(token, email, newPassword);
            setIsSuccess(true);
            toast.success('Đặt lại mật khẩu thành công!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-300">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-900 text-center">
                        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Link không hợp lệ</h2>
                        <p className="text-gray-400 mb-6">
                            Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.
                            Vui lòng yêu cầu link mới.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-xl hover:from-pink-700 hover:to-red-700 transition"
                        >
                            Yêu cầu link mới
                        </Link>
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-gray-400 hover:text-white transition"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-green-900 text-center">
                        <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Thành công!</h2>
                        <p className="text-gray-400 mb-6">
                            Mật khẩu của bạn đã được đặt lại thành công.
                            Bạn có thể đăng nhập với mật khẩu mới.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-pink-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
                        {userName && (
                            <p className="text-gray-400">
                                Xin chào <strong className="text-pink-400">{userName}</strong>
                            </p>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ít nhất 6 ký tự"
                                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                    disabled={isLoading}
                                />
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-red-400 text-sm mt-1">Mật khẩu không khớp</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || newPassword !== confirmPassword}
                            className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-xl hover:from-pink-700 hover:to-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đặt lại mật khẩu'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-gray-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
