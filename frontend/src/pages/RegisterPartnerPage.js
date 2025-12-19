// File: frontend/src/pages/RegisterPartnerPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Handshake, ArrowLeft, CheckCircle, Star, Store, Gift, Users, MessageCircle } from 'lucide-react';
import { useCurrencyStore } from '../store/currencyStore';

export default function RegisterPartnerPage() {
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        email: '',
        discordUsername: '',
        shopDescription: '',
        partnershipType: '',
        experience: '',
        whyPartner: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { rate } = useCurrencyStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['shopName', 'ownerName', 'email', 'discordUsername', 'partnershipType', 'whyPartner'];
        const missingFields = requiredFields.filter(f => !formData[f]);

        if (missingFields.length > 0) {
            toast.error('Vui lòng điền đầy đủ tất cả thông tin bắt buộc (*)');
            return;
        }

        if (!acceptedTerms) {
            toast.error('Bạn phải đồng ý với điều khoản để tiếp tục');
            return;
        }

        try {
            setIsLoading(true);
            // TODO: Gửi yêu cầu partnership lên backend
            // await apiClient.post('/partnership/register', formData);

            setIsSubmitted(true);
            toast.success('Đăng ký đối tác thành công! Chúng tôi sẽ liên hệ sớm nhất.');
        } catch (error) {
            toast.error(error.message || 'Đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-lg mx-auto text-center space-y-6 py-8">
                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Đăng Ký Thành Công!</h1>
                <div className="glass-panel p-6 rounded-2xl text-left space-y-4">
                    <p className="text-gray-300">
                        Cảm ơn <strong className="text-yellow-400">{formData.shopName}</strong> đã đăng ký làm đối tác với Tài Lộc Shop!
                    </p>
                    <p className="text-gray-400 text-sm">
                        Chúng tôi đã nhận được thông tin của bạn. Admin sẽ liên hệ qua <strong className="text-blue-400">Discord</strong> trong vòng 24-48 giờ để trao đổi chi tiết.
                    </p>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                        <p className="text-yellow-400 font-bold text-lg">🎉 Luôn chào đón mọi Đối tác tiềm năng 🎉</p>
                    </div>
                </div>
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

            <div className="glass-panel p-8 rounded-2xl border border-yellow-500/20">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <Handshake className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Đăng Ký Làm Đối Tác</h1>
                    <p className="text-gray-400 mt-2">Hợp tác kinh doanh cùng Tài Lộc Shop</p>

                    {/* Note đặc biệt */}
                    <div className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full">
                        <span className="text-yellow-400 font-bold">🌟 Luôn chào đón mọi Đối tác tiềm năng 🌟</span>
                    </div>
                </div>

                {/* LỢI ÍCH ĐỐI TÁC */}
                <div className="mb-8 space-y-4">
                    <div className="p-5 bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-500/30 rounded-xl">
                        <h3 className="font-bold text-yellow-400 flex items-center gap-2 mb-3">
                            <Star className="w-5 h-5" />
                            LỢI ÍCH KHI LÀM ĐỐI TÁC
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2 text-gray-300">
                                <Store className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span>Được <strong className="text-yellow-400">treo vật phẩm</strong> trên website TaiLocShop</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <Gift className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Tiếp cận <strong className="text-green-400">hàng ngàn khách hàng</strong></span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Được <strong className="text-blue-400">quảng bá shop</strong> trên website</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <MessageCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                <span>Hỗ trợ <strong className="text-purple-400">24/7</strong> từ admin</span>
                            </div>
                        </div>
                    </div>

                    {/* CHÍNH SÁCH VÀ PHÍ */}
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <h3 className="font-bold text-red-400 flex items-center gap-2 mb-3">
                            💰 CHÍNH SÁCH PHÍ ĐỐI TÁC
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="font-bold text-orange-400 mb-1">📌 Phí treo hàng (Listing Fee)</p>
                                <p className="text-gray-300">Mỗi vật phẩm treo: <strong className="text-yellow-400">5.000$ - 20.000$/tuần</strong> (tùy loại)</p>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="font-bold text-orange-400 mb-1">📌 Phí chiết khấu (Commission)</p>
                                <p className="text-gray-300">Mỗi đơn bán được: <strong className="text-yellow-400">5% - 10%</strong> giá trị đơn</p>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="font-bold text-orange-400 mb-1">📌 Phí quảng cáo (Ads)</p>
                                <p className="text-gray-300">Banner homepage: <strong className="text-yellow-400">50.000$/tuần</strong></p>
                                <p className="text-gray-300">Spotlight item: <strong className="text-yellow-400">30.000$/tuần</strong></p>
                            </div>
                            <p className="text-gray-500 text-xs italic mt-2">* Tỷ giá: 1 Xu = {rate.toLocaleString()}$. Giá có thể thương lượng.</p>
                        </div>
                    </div>

                    {/* Loại hình đối tác */}
                    <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-3">
                            <Handshake className="w-5 h-5" />
                            LOẠI HÌNH HỢP TÁC
                        </h3>
                        <ul className="text-sm text-gray-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                <span><strong>Shop ký gửi:</strong> Treo vật phẩm trên TaiLocShop, chúng tôi thu phí treo + chiết khấu khi bán</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                <span><strong>Đại lý:</strong> Bán hàng nhận hoa hồng từ các đơn giới thiệu</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                <span><strong>Đối tác quảng cáo:</strong> Mua banner/spotlight để quảng bá shop</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* FORM ĐĂNG KÝ */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">📝 Thông tin đối tác</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tên shop */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tên Shop / Dự án *</label>
                            <input
                                type="text"
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                placeholder="VD: Shop XYZ"
                                required
                            />
                        </div>

                        {/* Tên chủ shop */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tên chủ shop (IGN) *</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                placeholder="Tên trong game"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email liên hệ *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        {/* Discord */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Discord Username *</label>
                            <input
                                type="text"
                                name="discordUsername"
                                value={formData.discordUsername}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                placeholder="VD: username#1234"
                                required
                            />
                        </div>

                        {/* Loại hình hợp tác */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Loại hình hợp tác mong muốn *</label>
                            <select
                                name="partnershipType"
                                value={formData.partnershipType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                required
                            >
                                <option value="">-- Chọn loại hình --</option>
                                <option value="linked_shop">Shop liên kết (giới thiệu khách hàng)</option>
                                <option value="agent">Đại lý (bán hàng nhận hoa hồng)</option>
                                <option value="ads">Quảng cáo (mua banner/spotlight)</option>
                                <option value="other">Khác (ghi rõ bên dưới)</option>
                            </select>
                        </div>
                    </div>

                    {/* Mô tả shop */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả về shop/dự án của bạn</label>
                        <textarea
                            name="shopDescription"
                            value={formData.shopDescription}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                            placeholder="Shop bán gì, hoạt động bao lâu, quy mô..."
                        />
                    </div>

                    {/* Kinh nghiệm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kinh nghiệm kinh doanh</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                            placeholder="Đã từng hợp tác với shop nào, kinh doanh bao lâu..."
                        />
                    </div>

                    {/* Lý do */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tại sao muốn hợp tác với Tài Lộc Shop? *</label>
                        <textarea
                            name="whyPartner"
                            value={formData.whyPartner}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none"
                            placeholder="Chia sẻ mong muốn và kế hoạch hợp tác..."
                            required
                        />
                    </div>

                    {/* Checkbox đồng ý điều khoản */}
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="text-sm text-gray-300">
                                Tôi đã đọc và <strong className="text-yellow-400">đồng ý với điều khoản hợp tác</strong>.
                                Tôi cam kết cung cấp thông tin chính xác và sẵn sàng trao đổi chi tiết qua Discord.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !acceptedTerms}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang gửi...' : '🤝 Gửi Đăng Ký Đối Tác'}
                    </button>
                </form>

                {/* Links to other registration pages */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-center text-gray-400 text-sm mb-3">Hoặc bạn muốn:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register/staff" className="text-blue-400 hover:underline text-sm">
                            Đăng ký làm Staff
                        </Link>
                        <span className="text-gray-600">|</span>
                        <Link to="/register/supplier" className="text-green-400 hover:underline text-sm">
                            Đăng ký làm Supplier
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
