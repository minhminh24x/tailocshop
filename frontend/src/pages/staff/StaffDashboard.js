// File: frontend/src/pages/staff/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaCoins, FaClipboardList, FaChartLine } from 'react-icons/fa';
import { RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatNumber } from '../../utils/formatNumber';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
    const [stats, setStats] = useState({
        completedOrders: 0,
        totalRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            // Gọi API để lấy thống kê (cần tạo endpoint này)
            const res = await apiClient.get('/stats/staff-summary');
            setStats({
                completedOrders: res.data.completedOrders || 0,
                totalRevenue: res.data.totalRevenue || 0,
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching staff stats:', error);
            // Nếu API chưa có, dùng mock data
            setStats({
                completedOrders: 0,
                totalRevenue: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Auto refresh mỗi 60 giây
        const interval = setInterval(fetchStats, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Dashboard Nhân viên</h1>
                <button
                    onClick={fetchStats}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards - Đơn giản hóa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Số đơn đã hoàn thành */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Đơn hàng đã hoàn thành
                            </p>
                            <p className="text-5xl font-bold text-white mt-3">
                                {isLoading ? '...' : formatNumber(stats.completedOrders)}
                            </p>
                            <p className="text-green-400 text-sm mt-2">Tổng số đơn COMPLETED</p>
                        </div>
                        <div className="p-4 bg-green-500/20 rounded-2xl">
                            <FaCheckCircle className="text-5xl text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Tổng doanh thu */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-900/50 to-orange-900/30 border border-yellow-500/30 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Tổng doanh thu
                            </p>
                            <p className="text-5xl font-bold text-white mt-3 flex items-center gap-2">
                                <FaCoins className="text-yellow-400" />
                                {isLoading ? '...' : formatNumber(stats.totalRevenue)}
                            </p>
                            <p className="text-yellow-400 text-sm mt-2">Tính từ đơn COMPLETED</p>
                        </div>
                        <div className="p-4 bg-yellow-500/20 rounded-2xl">
                            <FaChartLine className="text-5xl text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
                <div className="flex gap-4">
                    <Link
                        to="/staff/orders"
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        <FaClipboardList className="mr-2" />
                        Xem Đơn hàng
                    </Link>
                </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
                <p className="text-center text-gray-500 text-sm mt-6">
                    Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
                </p>
            )}
        </div>
    );
}
