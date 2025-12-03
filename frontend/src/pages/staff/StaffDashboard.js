// File: frontend/src/pages/staff/StaffDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';

export default function StaffDashboard() {
    // Mock data (Sau này sẽ fetch từ API)
    const stats = [
        { title: 'Đơn chờ xử lý', value: 12, icon: FaClipboardList, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
        { title: 'Đang chuẩn bị', value: 5, icon: FaBoxOpen, color: 'text-blue-400', bg: 'bg-blue-900/30' },
        { title: 'Đã hoàn thành (Hôm nay)', value: 28, icon: FaCheckCircle, color: 'text-green-400', bg: 'bg-green-900/30' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Tổng quan Nhân viên</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className={`p-6 rounded-xl shadow-lg border border-gray-700 ${stat.bg}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                            </div>
                            <stat.icon className={`text-4xl ${stat.color} opacity-80`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
                <div className="flex gap-4">
                    <Link
                        to="/staff/orders"
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        <FaClipboardList className="mr-2" />
                        Quản lý Đơn hàng
                    </Link>
                    {/* Có thể thêm các nút khác sau này */}
                </div>
            </div>
        </div>
    );
}
