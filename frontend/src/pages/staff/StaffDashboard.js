// File: frontend/src/pages/staff/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaCoins, FaClipboardList, FaChartLine, FaClock, FaExclamationCircle, FaCalendarDay } from 'react-icons/fa';
import { RefreshCw, TrendingUp, Package, Users } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatNumber } from '../../utils/formatNumber';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
    const [stats, setStats] = useState({
        completedOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        todayOrders: 0,
        processingOrders: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.get('/stats/staff-summary');
            setStats({
                completedOrders: res.data.completedOrders || 0,
                totalRevenue: res.data.totalRevenue || 0,
                pendingOrders: res.data.pendingOrders || 0,
                todayOrders: res.data.todayOrders || 0,
                processingOrders: res.data.processingOrders || 0,
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching staff stats:', error);
            setStats({
                completedOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                todayOrders: 0,
                processingOrders: 0,
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
                    <h1 className="text-3xl font-bold text-white">Dashboard Nhân viên</h1>
                    <p className="text-gray-400 mt-1">Xem tổng quan và quản lý đơn hàng</p>
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
                {/* Đơn chờ xử lý */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/50 to-red-900/30 border border-orange-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Đơn chờ xử lý
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.pendingOrders)}
                            </p>
                            <p className="text-orange-400 text-xs mt-1">PENDING</p>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                            <FaExclamationCircle className="text-3xl text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Đang xử lý */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/50 to-indigo-900/30 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Đang xử lý
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.processingOrders)}
                            </p>
                            <p className="text-blue-400 text-xs mt-1">PREPARING + READY</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <FaClock className="text-3xl text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Đơn hoàn thành */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Đã hoàn thành
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.completedOrders)}
                            </p>
                            <p className="text-green-400 text-xs mt-1">COMPLETED</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <FaCheckCircle className="text-3xl text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Hôm nay */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/30 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Hôm nay
                            </p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {isLoading ? '...' : formatNumber(stats.todayOrders)}
                            </p>
                            <p className="text-purple-400 text-xs mt-1">Đơn mới</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <FaCalendarDay className="text-3xl text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Card - Full Width */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-900/50 to-orange-900/30 border border-yellow-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                            Tổng doanh thu (Xu)
                        </p>
                        <p className="text-5xl font-bold text-white mt-3 flex items-center gap-2">
                            <FaCoins className="text-yellow-400" />
                            {isLoading ? '...' : formatNumber(stats.totalRevenue)}
                        </p>
                        <p className="text-yellow-400 text-sm mt-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Từ các đơn COMPLETED
                        </p>
                    </div>
                    <div className="p-6 bg-yellow-500/20 rounded-2xl">
                        <FaChartLine className="text-6xl text-yellow-400" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    Thao tác nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/staff/orders"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                    >
                        <FaClipboardList className="text-xl" />
                        Xem tất cả đơn hàng
                    </Link>
                    <Link
                        to="/staff/orders?status=PENDING"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition"
                    >
                        <FaExclamationCircle className="text-xl" />
                        Đơn cần xử lý ({stats.pendingOrders})
                    </Link>
                    <Link
                        to="/staff/orders?status=READY_FOR_DELIVERY"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition"
                    >
                        <FaCheckCircle className="text-xl" />
                        Đơn sẵn sàng giao
                    </Link>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Mẹo cho Staff
                </h3>
                <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Ưu tiên xử lý đơn PENDING trước để khách không phải chờ lâu</li>
                    <li>• Kiểm tra kỹ số lượng và vật phẩm trước khi giao</li>
                    <li>• Luôn xác nhận thanh toán trước khi hoàn thành đơn</li>
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
