// File: frontend/src/pages/PrivacyPage.js
import React from 'react';
import { Shield, Lock, Eye, FileText, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
                    <Shield className="text-yellow-400" />
                    Chính sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Bảo mật</span>
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
                            Chính sách bảo mật này đang trong giai đoạn dự thảo và sẽ được cập nhật sau khi được cấp phép hoạt động chính thức.
                            Nội dung có thể thay đổi sau khi tham vấn với quản trị viên hệ thống.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section 1 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-blue-400" />
                        1. Giới thiệu
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>
                            Tài Lộc Shop ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư của người dùng
                            ("bạn", "khách hàng"). Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng
                            và bảo vệ thông tin cá nhân của bạn.
                        </p>
                        <p>
                            Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản trong chính sách này.
                        </p>
                    </div>
                </section>

                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Eye className="text-green-400" />
                        2. Thông tin chúng tôi thu thập
                    </h2>
                    <div className="text-gray-300 space-y-4">
                        <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="font-bold text-green-400 mb-2">👤 Thông tin tài khoản</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Email:</strong> Dùng để đăng nhập, khôi phục mật khẩu và gửi thông báo quan trọng (ví dụ: xác nhận đơn hàng)</li>
                                <li><strong>Tên trong game (IGN):</strong> Hiển thị trong hệ thống, dùng để Staff liên hệ giao hàng trong Minecraft</li>
                                <li><strong>Mật khẩu:</strong> Được mã hóa bcrypt, chúng tôi KHÔNG lưu mật khẩu gốc</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="font-bold text-blue-400 mb-2">📊 Thông tin giao dịch</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Lịch sử đơn hàng:</strong> Các vật phẩm đã mua, số lượng, giá tiền, thời gian đặt hàng</li>
                                <li><strong>Số Xu đã chi tiêu:</strong> Tổng số Xu tích lũy để tính cấp độ VIP</li>
                                <li><strong>Cấp độ VIP:</strong> Tự động tính toán dựa trên tổng chi tiêu</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="font-bold text-purple-400 mb-2">💻 Thông tin kỹ thuật</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Địa chỉ IP:</strong> Dùng để bảo vệ tài khoản, phát hiện truy cập bất thường và rate limiting</li>
                                <li><strong>Trình duyệt & thiết bị:</strong> Để tối ưu hiển thị website cho đúng thiết bị của bạn</li>
                                <li><strong>Thời gian truy cập:</strong> Để thống kê hoạt động và cải thiện dịch vụ</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="font-bold text-orange-400 mb-2">🍪 Cookie</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Session cookie:</strong> Duy trì trạng thái đăng nhập trong phiên làm việc</li>
                                <li><strong>JWT token:</strong> Lưu trong localStorage để xác thực API requests</li>
                                <li><strong>Cart data:</strong> Lưu giỏ hàng tạm thời trong trình duyệt</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Lock className="text-purple-400" />
                        3. Cách chúng tôi sử dụng thông tin
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>Thông tin của bạn được sử dụng cho các mục đích sau:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Xử lý và hoàn thành đơn hàng của bạn</li>
                            <li>Tính toán và cập nhật cấp độ VIP</li>
                            <li>Cung cấp hỗ trợ khách hàng</li>
                            <li>Gửi thông báo quan trọng về tài khoản</li>
                            <li>Cải thiện trải nghiệm người dùng</li>
                            <li>Phát hiện và ngăn chặn gian lận</li>
                        </ul>
                    </div>
                </section>

                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="text-yellow-400" />
                        4. Bảo mật dữ liệu
                    </h2>
                    <div className="text-gray-300 space-y-4">
                        <p>Chúng tôi áp dụng các biện pháp bảo mật sau:</p>

                        <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                            <h4 className="font-bold text-green-400 mb-2">🔐 Mã hóa mật khẩu (bcrypt)</h4>
                            <p className="text-sm">Mật khẩu của bạn được mã hóa bằng thuật toán bcrypt với salt rounds = 10. Ngay cả Admin cũng KHÔNG thể biết mật khẩu gốc của bạn. Nếu bạn quên mật khẩu, chỉ có cách tạo mới.</p>
                        </div>

                        <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                            <h4 className="font-bold text-blue-400 mb-2">🔒 HTTPS (SSL/TLS)</h4>
                            <p className="text-sm">Toàn bộ kết nối được mã hóa TLS 1.3. Dữ liệu truyền giữa trình duyệt và server không thể bị đọc bởi người thứ ba. Cloudflare cung cấp chứng chỉ SSL.</p>
                        </div>

                        <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                            <h4 className="font-bold text-purple-400 mb-2">🎫 JWT Token</h4>
                            <p className="text-sm">Xác thực bằng JSON Web Token có thời hạn 7 ngày. Token được ký bằng secret key bí mật. Token không chứa mật khẩu, chỉ chứa userId và role.</p>
                        </div>

                        <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
                            <h4 className="font-bold text-orange-400 mb-2">⛔ Rate Limiting</h4>
                            <p className="text-sm">Giới hạn số lượng request để chống tấn công DDoS và brute force. Đăng nhập sai nhiều lần sẽ bị tạm khóa IP trong 15 phút.</p>
                        </div>

                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                            <h4 className="font-bold text-red-400 mb-2">🚨 KHÔNG chia sẻ với bên thứ 3</h4>
                            <p className="text-sm">Chúng tôi <strong>TUYỆT ĐỐI KHÔNG</strong> bán, cho thuê hoặc chia sẻ email, tên trong game hay bất kỳ dữ liệu nào của bạn cho bên thứ 3 vì mục đích thương mại.</p>
                        </div>
                    </div>
                </section>

                {/* Section 5 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">
                        5. Chia sẻ thông tin với bên thứ ba
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>
                            Chúng tôi <strong>KHÔNG</strong> bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn
                            với bên thứ ba vì mục đích thương mại.
                        </p>
                        <p>
                            Thông tin chỉ có thể được chia sẻ trong các trường hợp sau:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Khi có yêu cầu của cơ quan pháp luật</li>
                            <li>Để bảo vệ quyền lợi hợp pháp của chúng tôi</li>
                            <li>Với sự đồng ý rõ ràng của bạn</li>
                        </ul>
                    </div>
                </section>

                {/* Section 6 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">
                        6. Quyền của bạn
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>Bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Quyền truy cập và xem dữ liệu của bạn</li>
                            <li>Quyền yêu cầu chỉnh sửa thông tin không chính xác</li>
                            <li>Quyền yêu cầu xóa tài khoản</li>
                            <li>Quyền từ chối nhận email quảng cáo</li>
                        </ul>
                        <p className="mt-4">
                            Để thực hiện các quyền này, vui lòng liên hệ:{' '}
                            <a href="mailto:loclm112.noreply@gmail.com" className="text-yellow-400 hover:underline">
                                loclm112.noreply@gmail.com
                            </a>
                        </p>
                    </div>
                </section>

                {/* Section 7 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">
                        7. Thay đổi chính sách
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>
                            Chúng tôi có quyền cập nhật chính sách bảo mật này bất cứ lúc nào.
                            Mọi thay đổi sẽ được thông báo trên trang web và có hiệu lực ngay khi được đăng tải.
                        </p>
                        <p>
                            Chúng tôi khuyến khích bạn kiểm tra trang này định kỳ để cập nhật những thay đổi mới nhất.
                        </p>
                    </div>
                </section>

                {/* Section 8 - Contact */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">
                        8. Liên hệ
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>
                            Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ chúng tôi qua:
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
