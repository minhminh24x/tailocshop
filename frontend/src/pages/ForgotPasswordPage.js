// File: frontend/src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }

        try {
            setIsLoading(true);
            await forgotPassword(email);
            setIsSubmitted(true);
            toast.success('Đã gửi email hướng dẫn!');
        } catch (error) {
            // Vẫn hiển thị success để bảo mật (không tiết lộ email có tồn tại hay không)
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 text-center">
                        <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Kiểm tra email của bạn</h2>
                        <p className="text-gray-400 mb-6">
                            Nếu tài khoản với email <strong className="text-pink-400">{email}</strong> tồn tại,
                            bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu trong vài phút.
                        </p>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">
                                Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau 5 phút.
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-pink-400 hover:text-pink-300 font-medium"
                            >
                                Gửi lại email
                            </button>
                        </div>
                        <div className="mt-8">
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-pink-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu?</h1>
                        <p className="text-gray-400">
                            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-xl hover:from-pink-700 hover:to-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Gửi link đặt lại
                                </>
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
