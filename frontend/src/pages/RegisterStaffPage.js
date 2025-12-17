import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users, ArrowLeft, Shield, CheckCircle, Clock, Award, DollarSign, Briefcase, AlertTriangle, FileCheck } from 'lucide-react';
import apiClient from '../services/apiClient';

export default function RegisterStaffPage() {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        inGameName: '',
        discordUsername: '', // Discord để liên hệ phỏng vấn
        currentRank: '', // Rank hiện tại trong game
        depositAmount: '', // Số xu dằn
        isStudent: '', // Có phải học sinh không
        availableHours: '', // Giờ có thể onl
        canWorkPeakHours: '', // Có làm được giờ cao điểm không
        previousExperience: '', // Kinh nghiệm trước đó
        whyJoin: '', // Lý do muốn tham gia
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields (password removed - will be auto-generated)
        const requiredFields = ['email', 'inGameName', 'discordUsername', 'currentRank', 'depositAmount', 'isStudent', 'availableHours', 'canWorkPeakHours', 'whyJoin'];
        const missingFields = requiredFields.filter(f => !formData[f]);

        if (missingFields.length > 0) {
            toast.error('Vui lòng điền đầy đủ tất cả thông tin bắt buộc (*)');
            return;
        }

        if (!acceptedTerms) {
            toast.error('Bạn phải đồng ý với điều khoản để tiếp tục');
            return;
        }

        // Validate deposit amount
        if (parseInt(formData.depositAmount) < 150) {
            toast.error('Số xu dằn tối thiểu là 150 xu');
            return;
        }

        try {
            setIsLoading(true);
            // [SỬA] Gửi đơn đăng ký lên API thay vì tạo user trực tiếp
            await apiClient.post('/applications', {
                type: 'STAFF',
                email: formData.email,
                inGameName: formData.inGameName,
                discord: formData.discordUsername,
                formData: {
                    currentRank: formData.currentRank,
                    depositAmount: formData.depositAmount,
                    isStudent: formData.isStudent,
                    availableHours: formData.availableHours,
                    canWorkPeakHours: formData.canWorkPeakHours,
                    whyJoin: formData.whyJoin,
                    experience: formData.experience,
                },
            });

            setIsSubmitted(true);
            toast.success('Đơn đăng ký đã được gửi! Vui lòng chờ liên hệ qua Discord.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gửi đơn thất bại');
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
                        Cảm ơn bạn đã đăng ký làm Staff tại <strong className="text-yellow-400">Tài Lộc Shop</strong>!
                    </p>
                    <p className="text-gray-400 text-sm">
                        Đơn ứng tuyển của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ bạn qua <strong className="text-blue-400">Discord</strong> để tiến hành phỏng vấn trong vòng 24-48 giờ.
                    </p>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <p className="text-sm font-medium text-blue-300">📌 Lưu ý:</p>
                        <ul className="text-sm text-gray-400 list-disc list-inside mt-2 space-y-1">
                            <li>Hãy đảm bảo Discord của bạn cho phép nhận tin nhắn từ người lạ</li>
                            <li>Chuẩn bị sẵn {formData.depositAmount} xu để dằn khi bắt đầu làm việc</li>
                            <li>Xem lại các điều khoản và chính sách của shop</li>
                        </ul>
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
        <div className="max-w-4xl mx-auto">
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

                {/* ĐIỀU KHOẢN VÀ YÊU CẦU */}
                <div className="mb-8 space-y-4">
                    {/* Yêu cầu */}
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <h3 className="font-bold text-red-400 flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5" />
                            YÊU CẦU BẮT BUỘC
                        </h3>
                        <ul className="text-sm text-gray-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>Rank tối thiểu: <strong className="text-yellow-400">Landlord</strong> hoặc cao hơn</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>Phải "dằn" vật phẩm tối thiểu <strong className="text-yellow-400">150 Xu</strong> khi bắt đầu làm việc</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>Có thể online vào các <strong className="text-yellow-400">khung giờ cao điểm</strong> (18h-22h)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>Cam kết làm việc nghiêm túc và trung thực</span>
                            </li>
                        </ul>
                    </div>

                    {/* Phúc lợi */}
                    <div className="p-5 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <h3 className="font-bold text-green-400 flex items-center gap-2 mb-3">
                            <Award className="w-5 h-5" />
                            PHÚC LỢI NHÂN VIÊN
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2 text-gray-300">
                                <DollarSign className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Được chia <strong className="text-green-400">20% doanh thu</strong> từ các đơn hàng</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <Award className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Hỗ trợ <strong className="text-blue-400">up rank</strong> trong game</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <Briefcase className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                <span>Làm việc trong <strong className="text-purple-400">môi trường chuyên nghiệp</strong></span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                                <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                                <span><strong className="text-orange-400">Thời gian linh hoạt</strong>, phù hợp học sinh/sinh viên</span>
                            </div>
                        </div>
                    </div>

                    {/* Quy trình */}
                    <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-3">
                            <FileCheck className="w-5 h-5" />
                            QUY TRÌNH TUYỂN DỤNG
                        </h3>
                        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                            <li>Điền đầy đủ form đăng ký bên dưới</li>
                            <li>Chờ Admin liên hệ qua <strong className="text-blue-400">Discord</strong> để phỏng vấn</li>
                            <li>Hoàn thành phỏng vấn và được cấp tài khoản Staff</li>
                            <li>Đặt cọc (dằn) vật phẩm và bắt đầu làm việc</li>
                        </ol>
                    </div>
                </div>

                {/* FORM ĐĂNG KÝ */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">📝 Thông tin đăng ký</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        {/* [NOTE] Mật khẩu tự động */}
                        <div className="md:col-span-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                            <p className="text-sm text-blue-300 flex items-center gap-2">
                                <span>🔐</span>
                                <span>Mật khẩu sẽ được <strong>tự động tạo và gửi qua email</strong> sau khi đơn được duyệt.</span>
                            </p>
                        </div>

                        {/* Tên trong game */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tên trong game *</label>
                            <input
                                type="text"
                                name="inGameName"
                                value={formData.inGameName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="Tên nhân vật Minecraft"
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
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="VD: player#1234"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Để liên hệ phỏng vấn</p>
                        </div>

                        {/* Rank hiện tại */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Rank hiện tại *</label>
                            <select
                                name="currentRank"
                                value={formData.currentRank}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">-- Chọn rank --</option>
                                <option value="Landlord">Landlord</option>
                                <option value="King">King</option>
                                <option value="Emperor">Emperor</option>
                                <option value="God">God</option>
                                <option value="Custom">Custom</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        {/* Số xu dằn */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Số xu có thể dằn *</label>
                            <input
                                type="number"
                                name="depositAmount"
                                value={formData.depositAmount}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                placeholder="Tối thiểu 150"
                                min="150"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Tối thiểu: 150 xu</p>
                        </div>

                        {/* Học sinh */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Bạn có đang là học sinh/sinh viên? *</label>
                            <select
                                name="isStudent"
                                value={formData.isStudent}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">-- Chọn --</option>
                                <option value="yes">Có, đang đi học</option>
                                <option value="no">Không, đã đi làm/nghỉ học</option>
                            </select>
                        </div>

                        {/* Giờ cao điểm */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Có thể làm việc giờ cao điểm (18h-22h)? *</label>
                            <select
                                name="canWorkPeakHours"
                                value={formData.canWorkPeakHours}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">-- Chọn --</option>
                                <option value="yes_always">Có, hầu như luôn được</option>
                                <option value="yes_sometimes">Có, nhưng không phải ngày nào cũng được</option>
                                <option value="no">Không, chỉ onl được giờ khác</option>
                            </select>
                        </div>
                    </div>

                    {/* Giờ onl */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Khung giờ có thể online mỗi ngày *</label>
                        <input
                            type="text"
                            name="availableHours"
                            value={formData.availableHours}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="VD: 14h-17h và 20h-22h"
                            required
                        />
                    </div>

                    {/* Kinh nghiệm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kinh nghiệm làm staff shop/server trước đây</label>
                        <textarea
                            name="previousExperience"
                            value={formData.previousExperience}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Để trống nếu chưa có kinh nghiệm..."
                        />
                    </div>

                    {/* Lý do */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tại sao bạn muốn làm staff Tài Lộc Shop? *</label>
                        <textarea
                            name="whyJoin"
                            value={formData.whyJoin}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Chia sẻ lý do và mục tiêu của bạn..."
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
                                Tôi đã đọc và <strong className="text-yellow-400">đồng ý với các yêu cầu và điều khoản</strong> trên. Tôi cam kết cung cấp thông tin chính xác và sẵn sàng phỏng vấn qua Discord.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !acceptedTerms}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang gửi...' : 'Gửi Đăng Ký Ứng Tuyển'}
                    </button>
                </form>

                <div className="text-center text-gray-400 text-sm mt-6 space-y-2">
                    <p>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-400 hover:underline">Đăng nhập</Link>
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
