import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Package, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

export default function RegisterSupplierPage() {
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        inGameName: '',
        companyName: '', // Tên công ty/shop
        description: '', // Mô tả về nguồn hàng
        portfolio: '', // Link tới shop/portfolio
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.inGameName || !formData.description) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            // Đăng ký tài khoản với role CUSTOMER trước
            // Sau đó admin sẽ duyệt và nâng cấp lên SUPPLIER
            await register(formData.email, formData.password, formData.inGameName);

            // TODO: Gửi yêu cầu supplier application lên backend
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
                    Tài khoản của bạn đã được tạo. Đơn đăng ký làm Nhà Cung Cấp sẽ được Admin xem xét trong vòng 24-48 giờ.
                </p>
                <p className="text-gray-400 text-sm">
                    Sau khi được duyệt, bạn sẽ nhận được email thông báo và có thể truy cập trang Supplier.
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

            <div className="glass-panel p-8 rounded-2xl border border-green-500/20">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Đăng Ký Nhà Cung Cấp</h1>
                    <p className="text-gray-400 mt-2">Trở thành đối tác của Tài Lộc Shop</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                            placeholder="Tên nhân vật Minecraft"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tên Shop/Công ty (tùy chọn)</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                            placeholder="Tên shop hoặc công ty của bạn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả nguồn hàng *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 resize-none"
                            placeholder="Bạn cung cấp những loại vật phẩm gì? Số lượng trung bình?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Link Portfolio/Shop (tùy chọn)</label>
                        <input
                            type="url"
                            name="portfolio"
                            value={formData.portfolio}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex gap-3">
                            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-medium text-white mb-1">Quyền lợi nhà cung cấp:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Nhập hàng và nhận thanh toán nhanh chóng</li>
                                    <li>Dashboard quản lý phiếu nhập riêng</li>
                                    <li>Hỗ trợ ưu tiên từ đội ngũ Admin</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Đang gửi...' : 'Gửi Đăng Ký'}
                    </button>
                </form>

                <div className="text-center text-gray-400 text-sm mt-6 space-y-2">
                    <p>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-green-400 hover:underline">Đăng nhập</Link>
                    </p>
                    <p>
                        Hoặc{' '}
                        <Link to="/register/partner" className="text-yellow-400 hover:underline font-medium">
                            🤝 Đăng ký làm Đối tác
                        </Link>
                        {' '}- Luôn chào đón shop PIN =]]
                    </p>
                </div>
            </div>
        </div>
    );
}
