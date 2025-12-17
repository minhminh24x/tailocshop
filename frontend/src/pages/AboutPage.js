import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Shield, HeartHandshake, Star, Award, Package, ThumbsUp, Clock } from 'lucide-react';
import apiClient from '../services/apiClient';

export default function AboutPage() {
    const [stats, setStats] = useState({
        customers: 0,
        orders: 0,
        satisfaction: 99,
        support: '24/7'
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real stats from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await apiClient.get('/stats/public');
                setStats(data);
            } catch (error) {
                // Use fallback data if API fails
                // Use fallback stats silently
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'An Toàn & Bảo Mật',
            description: 'Mọi giao dịch được mã hóa và bảo mật tuyệt đối. Thông tin của bạn được bảo vệ an toàn.'
        },
        {
            icon: Star,
            title: 'Chất Lượng Hàng Đầu',
            description: 'Cam kết cung cấp các vật phẩm chất lượng cao nhất từ các nhà cung cấp uy tín.'
        },
        {
            icon: HeartHandshake,
            title: 'Hỗ Trợ 24/7',
            description: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.'
        },
        {
            icon: Award,
            title: 'Chương Trình VIP',
            description: 'Nhận ưu đãi giảm giá lên đến 20% với hệ thống VIP độc quyền.'
        }
    ];

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K+';
        }
        return num.toString() + '+';
    };

    return (
        <div className="space-y-16">
            {/* Hero */}
            <section className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">Về Tài Lộc Shop</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white">
                    Cửa Hàng <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Vật Phẩm Game</span> Hàng Đầu
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Chúng tôi tự hào là đối tác tin cậy của hàng ngàn game thủ, cung cấp vật phẩm Minecraft chất lượng với giá cả cạnh tranh nhất.
                </p>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature) => (
                    <div key={feature.title} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl">
                                <feature.icon className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Stats - [SỬA] Dùng dữ liệu thực từ API */}
            <section className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl p-8 border border-yellow-500/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <Users className="w-8 h-8 text-yellow-400 mb-2" />
                        <p className="text-4xl font-black text-yellow-400">
                            {isLoading ? '...' : formatNumber(stats.customers)}
                        </p>
                        <p className="text-gray-400 mt-2">Khách hàng</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Package className="w-8 h-8 text-yellow-400 mb-2" />
                        <p className="text-4xl font-black text-yellow-400">
                            {isLoading ? '...' : formatNumber(stats.orders)}
                        </p>
                        <p className="text-gray-400 mt-2">Đơn hàng</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <ThumbsUp className="w-8 h-8 text-yellow-400 mb-2" />
                        <p className="text-4xl font-black text-yellow-400">
                            {isLoading ? '...' : `${stats.satisfaction}%`}
                        </p>
                        <p className="text-gray-400 mt-2">Hài lòng</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Clock className="w-8 h-8 text-yellow-400 mb-2" />
                        <p className="text-4xl font-black text-yellow-400">
                            {stats.support}
                        </p>
                        <p className="text-gray-400 mt-2">Hỗ trợ</p>
                    </div>
                </div>
            </section>

            {/* Team Registration */}
            <section className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-white">Tham Gia Đội Ngũ Của Chúng Tôi</h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Bạn muốn trở thành một phần của Tài Lộc Shop? Đăng ký ngay để trở thành nhân viên hoặc nhà cung cấp!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                    <Link
                        to="/register/staff"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all"
                    >
                        <Users className="w-5 h-5" />
                        Đăng ký làm Staff
                    </Link>
                    <Link
                        to="/register/supplier"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all"
                    >
                        <HeartHandshake className="w-5 h-5" />
                        Đăng ký Nhà Cung Cấp
                    </Link>
                    <Link
                        to="/register/partner"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl transition-all"
                    >
                        <Sparkles className="w-5 h-5" />
                        Đăng ký làm Đối tác
                    </Link>
                </div>
            </section>

            {/* Contact */}
            <section className="glass-panel p-8 rounded-2xl text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Liên Hệ Với Chúng Tôi</h2>
                <p className="text-gray-400 mb-6">Có câu hỏi? Chúng tôi luôn sẵn sàng hỗ trợ!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="mailto:support@tailocshop.com" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all">
                        📧 support@tailocshop.com
                    </a>
                    <Link to="/support" className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-xl transition-all">
                        Gửi yêu cầu hỗ trợ
                    </Link>
                </div>
            </section>
        </div>
    );
}
