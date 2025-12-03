// File: frontend/src/pages/supplier/SupplierDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaPlusCircle, FaHistory } from 'react-icons/fa';

export default function SupplierDashboard() {
    // Mock data
    const stats = [
        { title: 'Phiếu chờ duyệt', value: 3, icon: FaHistory, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
        { title: 'Đã được duyệt', value: 15, icon: FaBoxOpen, color: 'text-green-400', bg: 'bg-green-900/30' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Tổng quan Nhà cung cấp</h1>

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

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
                <div className="flex gap-4">
                    <Link
                        to="/supplier/create-submission"
                        className="flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
                    >
                        <FaPlusCircle className="mr-2" />
                        Tạo Phiếu nhập hàng
                    </Link>
                </div>
            </div>
        </div>
    );
}
