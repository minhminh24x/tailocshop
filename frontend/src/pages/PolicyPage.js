// File: frontend/src/pages/PolicyPage.js
import React from 'react';
import { Shield, Lock, Eye, FileText, AlertTriangle, ShoppingCart, RefreshCw, Scale } from 'lucide-react';

export default function PolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
                    <Shield className="text-yellow-400" />
                    Chính sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">và Bảo mật</span>
                </h1>
                <p className="text-gray-400">
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </div>

            {/* Thông báo quan trọng */}
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-2">Lưu ý quan trọng</h3>
                        <p className="text-gray-300 text-sm">
                            Các chính sách này đang trong giai đoạn dự thảo và sẽ được cập nhật sau khi được cấp phép hoạt động chính thức.
                            Nội dung có thể thay đổi sau khi tham vấn với quản trị viên hệ thống.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* CHÍNH SÁCH MUA HÀNG */}
                <section className="glass-panel rounded-2xl p-6 border border-green-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <ShoppingCart className="text-green-400" />
                        Chính sách Mua hàng
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-green-400 mb-2">1. Đơn vị tiền tệ</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Xu (Coin)</strong>: Đơn vị chính, quy đổi từ vật phẩm trong game</li>
                                <li><strong>USD</strong>: Thanh toán bằng tiền thật (qua PayPal, Banking)</li>
                                <li>Tỷ giá quy đổi được hiển thị trên website</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-green-400 mb-2">2. Quy trình đặt hàng</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Thêm vật phẩm vào giỏ hàng</li>
                                <li>Chọn khung giờ giao hàng</li>
                                <li>Xác nhận đơn hàng</li>
                                <li>Chờ Staff liên hệ giao hàng trong game</li>
                                <li>Thanh toán và nhận hàng</li>
                            </ol>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-green-400 mb-2">3. Giảm giá VIP</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Mua hàng tích lũy Xu → Lên cấp VIP</li>
                                <li>VIP cao hơn = Giảm giá nhiều hơn (tối đa 20%)</li>
                                <li>Giảm giá áp dụng tự động khi thanh toán bằng Xu</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CHÍNH SÁCH HOÀN TRẢ */}
                <section className="glass-panel rounded-2xl p-6 border border-orange-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <RefreshCw className="text-orange-400" />
                        Chính sách Hoàn trả
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-orange-400 mb-2">1. Trường hợp được hoàn trả</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Giao sai vật phẩm so với đơn hàng</li>
                                <li>Giao thiếu số lượng</li>
                                <li>Vật phẩm bị lỗi do Shop</li>
                                <li>Đơn hàng chưa được xử lý trong 24h</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-orange-400 mb-2">2. KHÔNG hoàn trả khi</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Khách hàng đổi ý sau khi nhận hàng</li>
                                <li>Vật phẩm đã được sử dụng trong game</li>
                                <li>Quá 24h kể từ khi nhận hàng</li>
                                <li>Không có bằng chứng giao dịch</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-orange-400 mb-2">3. Quy trình hoàn trả</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Liên hệ Admin qua Discord trong vòng 24h</li>
                                <li>Cung cấp mã đơn hàng và bằng chứng</li>
                                <li>Chờ Admin xác minh (trong 48h)</li>
                                <li>Nhận hoàn tiền (Xu) hoặc đổi hàng</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* ĐIỀU KHOẢN SỬ DỤNG */}
                <section className="glass-panel rounded-2xl p-6 border border-blue-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Scale className="text-blue-400" />
                        Điều khoản Sử dụng
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-blue-400 mb-2">Quy tắc cấm</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Sử dụng nhiều tài khoản để lạm dụng voucher</li>
                                <li>Gian lận, lừa đảo nhân viên hoặc khách hàng khác</li>
                                <li>Cố tình hủy đơn nhiều lần không lý do</li>
                                <li>Spam, quấy rối nhân viên</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                            <h3 className="font-bold text-red-400 mb-2">⚠️ Vi phạm sẽ bị</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Cảnh cáo lần 1</li>
                                <li>Khóa tài khoản tạm thời lần 2</li>
                                <li>Khóa vĩnh viễn lần 3</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CHÍNH SÁCH BẢO MẬT */}
                <section className="glass-panel rounded-2xl p-6 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Lock className="text-purple-400" />
                        Chính sách Bảo mật
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Thông tin thu thập
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Tài khoản:</strong> Email, tên trong game, mật khẩu (đã mã hóa)</li>
                                <li><strong>Giao dịch:</strong> Lịch sử đơn hàng, số xu đã chi tiêu</li>
                                <li><strong>Kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Bảo mật dữ liệu
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Mật khẩu được mã hóa bằng bcrypt</li>
                                <li>Kết nối HTTPS mã hóa SSL/TLS</li>
                                <li>Token JWT cho xác thực an toàn</li>
                                <li><strong>KHÔNG</strong> chia sẻ thông tin với bên thứ 3</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Quyền của bạn
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Xem và chỉnh sửa thông tin cá nhân</li>
                                <li>Yêu cầu xóa tài khoản</li>
                                <li>Từ chối email quảng cáo</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* LIÊN HỆ */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">
                        📧 Liên hệ
                    </h2>
                    <div className="text-gray-300">
                        <p className="mb-4">
                            Nếu bạn có câu hỏi về các chính sách này, vui lòng liên hệ:
                        </p>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <p><strong>Email:</strong>{' '}
                                <a href="mailto:loclm112.noreply@gmail.com" className="text-yellow-400 hover:underline">
                                    loclm112.noreply@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer note */}
            <div className="text-center mt-12 text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Tài Lộc Shop. Tất cả quyền được bảo lưu.</p>
            </div>
        </div>
    );
}
