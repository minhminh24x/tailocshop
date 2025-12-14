import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Users, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

export default function RegisterStaffPage() {
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        inGameName: '',
        reason: '', // Lý do muốn làm staff
        experience: '', // Kinh nghiệm
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.inGameName || !formData.reason) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            // Đăng ký tài khoản với role CUSTOMER trước
            // Sau đó admin sẽ duyệt và nâng cấp lên STAFF
            await register(formData.email, formData.password, formData.inGameName);

            // TODO: Gửi yêu cầu staff application lên backend
            // Tạm thời chỉ hiện success message
            setIsSubmitted(true);
            toast.success('Đăng ký thành công! Đơn của bạn sẽ được Admin xem xét.');
        } catch (error) {
            toast.error(error.message || 'Đăng ký thất bại');
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Đăng Ký Thành Công!</h1>
                <p className="text-gray-400">
                    Tài khoản của bạn đã được tạo. Đơn đăng ký làm Staff sẽ được Admin xem xét trong vòng 24-48 giờ.
                </p>
                <p className="text-gray-400 text-sm">
                    Sau khi được duyệt, bạn sẽ nhận được email thông báo và có thể truy cập trang Staff.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-xl transition-all"
                >
                    Về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            <Link to="/about" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Quay lại
            </Link>

            <div className="glass-panel p-8 rounded-2xl border border-blue-500/20">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Đăng Ký Làm Staff</h1>
                    <p className="text-gray-400 mt-2">Tham gia đội ngũ Tài Lộc Shop</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="Ít nhất 6 ký tự"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tên trong game</label>
                        <input
                            type="text"
                            name="inGameName"
                            value={formData.inGameName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="Tên nhân vật Minecraft"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Lý do muốn làm Staff *</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Tại sao bạn muốn tham gia đội ngũ của chúng tôi?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kinh nghiệm (tùy chọn)</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Kinh nghiệm làm việc hoặc chơi Minecraft..."
                        />
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <div className="flex gap-3">
                            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-300">
                                Sau khi đăng ký, Admin sẽ xem xét đơn của bạn. Nếu được chấp nhận, tài khoản sẽ được nâng cấp lên Staff.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Đang gửi...' : 'Gửi Đăng Ký'}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-400 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
