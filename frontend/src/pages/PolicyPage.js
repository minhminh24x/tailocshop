import React from 'react';
import { Shield, Lock, Eye, FileText, AlertTriangle, ShoppingCart, RefreshCw, Scale } from 'lucide-react';
import { useCurrencyStore } from '../store/currencyStore';

export default function PolicyPage() {
    const { rate } = useCurrencyStore();
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
                                <li><strong>$ (USD)</strong>: Tiền trong server (không phải tiền thật)</li>
                                <li>Tỷ giá quy đổi: <strong className="text-yellow-400">1 Xu = {rate.toLocaleString()}$</strong> (theo tỷ giá XU_TO_USD)</li>
                                <li>Thanh toán bằng vật phẩm hoặc tiền trong game</li>
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
                            <h3 className="font-bold text-green-400 mb-4">3. Hệ thống VIP</h3>
                            <p className="text-sm mb-4">
                                Mua hàng tích lũy Xu → Tự động lên cấp VIP → Hưởng giảm giá khi thanh toán bằng Xu
                            </p>

                            {/* VIP Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="py-2 px-3 text-left">Cấp VIP</th>
                                            <th className="py-2 px-3 text-center">Xu tích lũy</th>
                                            <th className="py-2 px-3 text-center">Giảm giá</th>
                                            <th className="py-2 px-3 text-left">Quyền lợi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr>
                                            <td className="py-3 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">🌱</span>
                                                    <span className="font-medium text-gray-300">Thường</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-gray-400">0 Xu</td>
                                            <td className="py-3 px-3 text-center text-gray-400">0%</td>
                                            <td className="py-3 px-3 text-gray-400 text-xs">Mua hàng cơ bản</td>
                                        </tr>
                                        <tr className="bg-green-900/10">
                                            <td className="py-3 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">🥉</span>
                                                    <span className="font-medium text-green-400">VIP 1</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-green-400 font-medium">40 Xu</td>
                                            <td className="py-3 px-3 text-center text-green-400 font-bold">2%</td>
                                            <td className="py-3 px-3 text-green-300 text-xs">Giảm giá + Badge VIP</td>
                                        </tr>
                                        <tr className="bg-blue-900/10">
                                            <td className="py-3 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">🥈</span>
                                                    <span className="font-medium text-blue-400">VIP 2</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-blue-400 font-medium">100 Xu</td>
                                            <td className="py-3 px-3 text-center text-blue-400 font-bold">5%</td>
                                            <td className="py-3 px-3 text-blue-300 text-xs">Giảm giá + Ưu tiên hỗ trợ</td>
                                        </tr>
                                        <tr className="bg-purple-900/10">
                                            <td className="py-3 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">🥇</span>
                                                    <span className="font-medium text-purple-400">VIP 3</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-purple-400 font-medium">250 Xu</td>
                                            <td className="py-3 px-3 text-center text-purple-400 font-bold">10%</td>
                                            <td className="py-3 px-3 text-purple-300 text-xs">Giảm giá + Quà tặng định kỳ</td>
                                        </tr>
                                        <tr className="bg-yellow-900/10">
                                            <td className="py-3 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">👑</span>
                                                    <span className="font-medium text-yellow-400">VIP 4</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-yellow-400 font-medium">500 Xu</td>
                                            <td className="py-3 px-3 text-center text-yellow-400 font-bold">15%</td>
                                            <td className="py-3 px-3 text-yellow-300 text-xs">Giảm giá tối đa + Ưu tiên cao nhất</td>
                                        </tr>
                                        <tr className="bg-gradient-to-r from-orange-900/20 to-red-900/20">
                                            <td className="py-3 px-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">💎</span>
                                                    <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">VIP 5</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-orange-400 font-medium">1000 Xu</td>
                                            <td className="py-3 px-3 text-center text-red-400 font-bold">20%</td>
                                            <td className="py-3 px-3 text-orange-300 text-xs">ELITE - Tất cả đặc quyền</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                * Giảm giá chỉ áp dụng khi thanh toán bằng Xu. Quyền lợi có thể thay đổi theo chính sách shop.
                            </p>
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

                {/* CHÍNH SÁCH NHÀ CUNG CẤP */}
                <section className="glass-panel rounded-2xl p-6 border border-green-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        📦 Chính sách Nhà Cung Cấp
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-green-400 mb-2">1. Thu nhập và Thanh toán</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Nhà cung cấp nhận <strong className="text-green-400">70%</strong> giá shop treo cho mỗi vật phẩm bán ra</li>
                                <li>Thanh toán được xử lý tự động qua hệ thống</li>
                                <li>Có thể theo dõi doanh thu realtime trên Dashboard</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-green-400 mb-2">2. Chỉ tiêu Hàng ngày</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Chỉ tiêu dựa trên <strong className="text-blue-400">số lượng tồn kho</strong> của từng loại vật phẩm</li>
                                <li>Khi tồn kho thấp → Ưu tiên bổ sung cho loại đó</li>
                                <li>Linh hoạt, không bắt buộc - khuyến khích hoàn thành</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-green-400 mb-2">3. Cam kết Đầu ra</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Shop <strong className="text-yellow-400">cam kết tiêu thụ toàn bộ</strong> nguyên liệu nhập từ Nhà cung cấp</li>
                                <li>Không lo ế hàng - đầu ra ổn định</li>
                                <li>Hỗ trợ ưu tiên từ đội ngũ Admin</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CHÍNH SÁCH NHÂN VIÊN (STAFF) */}
                <section className="glass-panel rounded-2xl p-6 border border-blue-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        👥 Chính sách Nhân Viên (Staff)
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-blue-400 mb-2">1. Yêu cầu Tham gia</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Rank tối thiểu: <strong className="text-yellow-400">Landlord</strong> trong game</li>
                                <li>Đặt cọc (dằn) tối thiểu <strong className="text-yellow-400">150 Xu</strong></li>
                                <li>Có thể online vào giờ cao điểm (18h-22h)</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-blue-400 mb-2">2. Quyền lợi</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Nhận <strong className="text-green-400">20%</strong> doanh thu từ các đơn hàng xử lý</li>
                                <li>Hỗ trợ up rank trong game</li>
                                <li>Thời gian làm việc linh hoạt</li>
                                <li>Môi trường làm việc chuyên nghiệp</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-blue-400 mb-2">3. Trách nhiệm</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Xử lý đơn hàng nhanh chóng và chính xác</li>
                                <li>Giao tiếp lịch sự với khách hàng</li>
                                <li>Báo cáo vấn đề kịp thời cho Admin</li>
                                <li>Tuân thủ quy trình của shop</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* GIẢI QUYẾT TRANH CHẤP */}
                <section className="glass-panel rounded-2xl p-6 border border-orange-500/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        ⚖️ Giải quyết Tranh chấp
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h3 className="font-bold text-orange-400 mb-2">Quy trình xử lý</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li><strong>Bước 1:</strong> Liên hệ Admin qua Discord với mã đơn hàng</li>
                                <li><strong>Bước 2:</strong> Cung cấp bằng chứng (screenshot, video nếu có)</li>
                                <li><strong>Bước 3:</strong> Admin xem xét và phản hồi trong 24-48h</li>
                                <li><strong>Bước 4:</strong> Giải quyết theo hướng đôi bên cùng có lợi</li>
                            </ol>
                        </div>

                        <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
                            <h3 className="font-bold text-orange-400 mb-2">📌 Lưu ý quan trọng</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Mọi giao dịch đều được ghi log trong hệ thống</li>
                                <li>Quyết định cuối cùng thuộc về Admin</li>
                                <li>Trường hợp phức tạp có thể mất thêm thời gian</li>
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
