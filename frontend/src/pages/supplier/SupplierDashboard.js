// File: frontend/src/pages/supplier/SupplierDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaPlusCircle, FaCheckCircle, FaCoins } from 'react-icons/fa';
import { RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatNumber } from '../../utils/formatNumber';

export default function SupplierDashboard() {
    const [stats, setStats] = useState({
        approvedSubmissions: 0,
        totalEarnings: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            // Gọi API để lấy thống kê (cần tạo endpoint này)
            const res = await apiClient.get('/stats/supplier-summary');
            setStats({
                approvedSubmissions: res.data.approvedSubmissions || 0,
                totalEarnings: res.data.totalEarnings || 0,
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching supplier stats:', error);
            // Nếu API chưa có, dùng mock data
            setStats({
                approvedSubmissions: 0,
                totalEarnings: 0,
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
                <h1 className="text-3xl font-bold text-white">Dashboard Nhà cung cấp</h1>
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
                {/* Số phiếu đã duyệt */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">
                                Phiếu nhập đã duyệt
                            </p>
                            <p className="text-5xl font-bold text-white mt-3">
                                {isLoading ? '...' : formatNumber(stats.approvedSubmissions)}
                            </p>
                            <p className="text-green-400 text-sm mt-2">Tổng số phiếu APPROVED</p>
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
                                Tổng thu nhập
                            </p>
                            <p className="text-5xl font-bold text-white mt-3 flex items-center gap-2">
                                <FaCoins className="text-yellow-400" />
                                {isLoading ? '...' : formatNumber(stats.totalEarnings)}
                            </p>
                            <p className="text-yellow-400 text-sm mt-2">Tính từ phiếu đã duyệt</p>
                        </div>
                        <div className="p-4 bg-yellow-500/20 rounded-2xl">
                            <FaBoxOpen className="text-5xl text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
                <div className="flex gap-4">
                    <Link
                        to="/supplier/create-submission"
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-semibold transition"
                    >
                        <FaPlusCircle className="mr-2" />
                        Tạo Phiếu nhập hàng
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
