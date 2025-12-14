// File: frontend/src/pages/PrivacyPage.js
import React from 'react';
import { Shield, Lock, Eye, FileText, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
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

                {/* Section 2 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Eye className="text-green-400" />
                        2. Thông tin chúng tôi thu thập
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Thông tin tài khoản:</strong> Email, tên trong game (In-Game Name), mật khẩu đã mã hóa</li>
                            <li><strong>Thông tin giao dịch:</strong> Lịch sử đơn hàng, số tiền đã chi tiêu, cấp độ VIP</li>
                            <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập</li>
                            <li><strong>Cookie:</strong> Dữ liệu phiên đăng nhập để duy trì trạng thái xác thực</li>
                        </ul>
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

                {/* Section 4 */}
                <section className="glass-panel rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="text-yellow-400" />
                        4. Bảo mật dữ liệu
                    </h2>
                    <div className="text-gray-300 space-y-3">
                        <p>Chúng tôi áp dụng các biện pháp bảo mật sau:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Mã hóa mật khẩu:</strong> Tất cả mật khẩu được mã hóa bằng bcrypt trước khi lưu trữ</li>
                            <li><strong>HTTPS:</strong> Tất cả kết nối được mã hóa SSL/TLS</li>
                            <li><strong>JWT Token:</strong> Sử dụng token bảo mật cho xác thực</li>
                            <li><strong>Giới hạn quyền truy cập:</strong> Chỉ nhân viên được ủy quyền mới có quyền truy cập dữ liệu</li>
                        </ul>
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
