// File: frontend/src/pages/ContactPage.js
import React, { useState } from 'react';
import { Mail, MessageSquare, Send, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const SUPPORT_EMAIL = 'loclm112.noreply@gmail.com';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/contact', formData);
            toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
            setSubmitted(true);
        } catch (error) {
            // Fallback: gợi ý gửi email trực tiếp
            toast.error('Không thể gửi tin nhắn. Vui lòng liên hệ trực tiếp qua email.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="bg-green-900/30 border border-green-500/50 rounded-2xl p-8 mb-8">
                    <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Cảm ơn bạn!</h2>
                    <p className="text-gray-300">
                        Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition"
                >
                    Gửi tin nhắn khác
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                    Liên hệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Hỗ trợ</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Bạn có câu hỏi, phản hồi hoặc cần hỗ trợ? Hãy liên hệ với chúng tôi!
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Mail className="text-yellow-400" />
                            Email Hỗ trợ
                        </h2>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="text-yellow-400 hover:text-yellow-300 text-lg font-medium break-all"
                        >
                            {SUPPORT_EMAIL}
                        </a>
                        <p className="text-gray-400 text-sm mt-2">
                            Chúng tôi sẽ phản hồi trong vòng 24-48 giờ làm việc.
                        </p>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="text-blue-400" />
                            Báo cáo lỗi / Yêu cầu
                        </h2>
                        <p className="text-gray-300 mb-3">
                            Nếu bạn gặp lỗi trong quá trình sử dụng hoặc có yêu cầu đặc biệt, vui lòng gửi email đến:
                        </p>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=[BUG REPORT]`}
                            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                        >
                            Báo cáo lỗi qua Email
                        </a>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="text-green-400" />
                            Thời gian phản hồi
                        </h2>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Ngày thường: 8:00 - 22:00</li>
                            <li>• Cuối tuần: 10:00 - 20:00</li>
                            <li>• Thời gian xử lý: 24-48 giờ</li>
                        </ul>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Send className="text-yellow-400" />
                        Gửi tin nhắn
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                placeholder="Nêu ngắn gọn vấn đề của bạn"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nội dung *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
                                placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Gửi tin nhắn
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-gray-500 text-xs text-center mt-4">
                        Hoặc gửi email trực tiếp đến <a href={`mailto:${SUPPORT_EMAIL}`} className="text-yellow-400 hover:underline">{SUPPORT_EMAIL}</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
