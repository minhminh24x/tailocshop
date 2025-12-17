// File: frontend/src/pages/supplier/SupplierDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaPlusCircle, FaCheckCircle, FaCoins, FaClock, FaTimesCircle, FaHistory } from 'react-icons/fa';
import { RefreshCw, TrendingUp, Package, FileText } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatNumber } from '../../utils/formatNumber';

export default function SupplierDashboard() {
    const [stats, setStats] = useState({
        pendingSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        totalEarnings: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.get('/stats/supplier-summary');
            setStats({
                pendingSubmissions: res.data.pendingSubmissions || 0,
                approvedSubmissions: res.data.approvedSubmissions || 0,
                rejectedSubmissions: res.data.rejectedSubmissions || 0,
                totalEarnings: res.data.totalEarnings || 0,
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching supplier stats:', error);
            setStats({
                pendingSubmissions: 0,
                approvedSubmissions: 0,
                rejectedSubmissions: 0,
                totalEarnings: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60 * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Nhà cung cấp</h1>
                    <p className="text-gray-400 mt-1">Quản lý phiếu nhập và theo dõi thu nhập</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Stats Grid - 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Đang chờ duyệt */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/50 to-amber-900/30 border border-orange-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Chờ duyệt
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.pendingSubmissions)}
                            </p>
                            <p className="text-orange-400 text-xs mt-1">PENDING</p>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                            <FaClock className="text-3xl text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Đã duyệt */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Đã duyệt
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.approvedSubmissions)}
                            </p>
                            <p className="text-green-400 text-xs mt-1">APPROVED</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <FaCheckCircle className="text-3xl text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Từ chối */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900/50 to-rose-900/30 border border-red-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Từ chối
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.rejectedSubmissions)}
                            </p>
                            <p className="text-red-400 text-xs mt-1">REJECTED</p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <FaTimesCircle className="text-3xl text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Tổng thu nhập */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-900/50 to-orange-900/30 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Thu nhập (Xu)
                            </p>
                            <p className="text-4xl font-bold text-white mt-2 flex items-center gap-1">
                                <FaCoins className="text-yellow-400 text-2xl" />
                                {isLoading ? '...' : formatNumber(stats.totalEarnings)}
                            </p>
                            <p className="text-yellow-400 text-xs mt-1">Tổng cộng</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <TrendingUp className="text-3xl text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    Thao tác nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/supplier/create-submission"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-semibold transition"
                    >
                        <FaPlusCircle className="text-xl" />
                        Tạo phiếu nhập mới
                    </Link>
                    <Link
                        to="/supplier/my-submissions"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                    >
                        <FaHistory className="text-xl" />
                        Xem phiếu của tôi
                    </Link>
                    <Link
                        to="/supplier/my-submissions?status=PENDING"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition"
                    >
                        <FaClock className="text-xl" />
                        Phiếu chờ duyệt ({stats.pendingSubmissions})
                    </Link>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Hướng dẫn cho Supplier
                </h3>
                <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Tạo phiếu nhập khi bạn có vật phẩm muốn bán cho shop</li>
                    <li>• Ghi rõ số lượng và giá mong muốn trong phiếu</li>
                    <li>• Chờ Admin duyệt phiếu, sau đó giao hàng để nhận thanh toán</li>
                    <li>• Liên hệ Admin qua Discord nếu phiếu bị từ chối</li>
                </ul>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
                <p className="text-center text-gray-500 text-sm">
                    Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
                </p>
            )}
        </div>
    );
}
