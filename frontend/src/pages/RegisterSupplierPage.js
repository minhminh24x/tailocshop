import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Package, ArrowLeft, Shield, CheckCircle, DollarSign, BarChart3, Clock } from 'lucide-react';

export default function RegisterSupplierPage() {
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        inGameName: '',
        companyName: '',
        description: '',
        portfolio: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
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

        if (!acceptedTerms) {
            toast.error('Bạn phải đồng ý với điều khoản để tiếp tục');
            return;
        }

        try {
            await register(formData.email, formData.password, formData.inGameName);
            setIsSubmitted(true);
            toast.success('Đăng ký thành công! Đơn của bạn sẽ được Admin xem xét.');
        } catch (error) {
            toast.error(error.message || 'Đăng ký thất bại');
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-lg mx-auto text-center space-y-6 py-8">
                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Đăng Ký Thành Công!</h1>
                <p className="text-gray-400">
                    Tài khoản của bạn đã được tạo. Đơn đăng ký làm Nhà Cung Cấp sẽ được Admin xem xét trong vòng 24-48 giờ.
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
        <div className="max-w-6xl mx-auto">
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
                    <p className="text-gray-400 mt-2">Trở thành đối tác cung ứng của Tài Lộc Shop</p>
                </div>

                {/* CHÍNH SÁCH NHÀ CUNG CẤP - ĐẶT TRƯỚC FORM */}
                <div className="mb-8 space-y-4">
                    {/* Thu nhập */}
                    <div className="p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-xl">
                        <h3 className="font-bold text-green-400 flex items-center gap-2 mb-3">
                            <DollarSign className="w-5 h-5" />
                            THU NHẬP HẤP DẪN
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <span className="text-green-400 font-bold text-lg">70%</span>
                                <span>giá shop treo cho mỗi vật phẩm bán ra</span>
                            </div>
                            <p className="text-gray-400 text-xs">
                                Ví dụ: Shop treo 10 Xu → Bạn nhận 7 Xu khi bán được
                            </p>
                        </div>
                    </div>

                    {/* Chỉ tiêu */}
                    <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-3">
                            <BarChart3 className="w-5 h-5" />
                            CHỈ TIÊU LINH HOẠT
                        </h3>
                        <ul className="text-sm text-gray-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                <span>Chỉ tiêu <strong className="text-blue-300">tùy thuộc vào tồn kho</strong> của từng loại vật phẩm</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                <span>Khi tồn kho thấp → Chỉ tiêu cao hơn để bổ sung</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                <span>Không áp lực, linh hoạt theo khả năng của bạn</span>
                            </li>
                        </ul>
                    </div>

                    {/* Đảm bảo đầu ra */}
                    <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <h3 className="font-bold text-yellow-400 flex items-center gap-2 mb-3">
                            ✅ ĐẢM BẢO ĐẦU RA
                        </h3>
                        <ul className="text-sm text-gray-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400">•</span>
                                <span>Shop cam kết <strong className="text-yellow-300">tiêu thụ toàn bộ</strong> nguyên liệu bạn cung cấp</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400">•</span>
                                <span>Thanh toán nhanh chóng qua hệ thống</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quyền lợi bổ sung */}
                    <div className="p-5 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <div className="flex gap-3">
                            <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-medium text-white mb-1">Quyền lợi bổ sung:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Dashboard quản lý phiếu nhập riêng</li>
                                    <li>Theo dõi doanh thu và thống kê chi tiết</li>
                                    <li>Hỗ trợ 24/7 từ đội ngũ Admin</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM ĐĂNG KÝ */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">📝 Thông tin đăng ký</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu *</label>
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tên trong game *</label>
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tên Shop/Công ty</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                                placeholder="Tên shop hoặc công ty (tùy chọn)"
                            />
                        </div>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Link Portfolio/Shop</label>
                        <input
                            type="url"
                            name="portfolio"
                            value={formData.portfolio}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                            placeholder="https://... (tùy chọn)"
                        />
                    </div>

                    {/* Checkbox đồng ý điều khoản */}
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-300">
                                Tôi đã đọc và <strong className="text-green-400">đồng ý với các điều khoản Nhà Cung Cấp</strong> ở trên.
                                Tôi cam kết cung cấp thông tin chính xác và vật phẩm đúng chất lượng.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !acceptedTerms}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang gửi...' : '📦 Gửi Đăng Ký Nhà Cung Cấp'}
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
                    </p>
                </div>
            </div>
        </div>
    );
}
