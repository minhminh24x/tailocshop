// File: frontend/src/pages/supplier/SupplierMySubmissions.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';
import { formatNumber } from '../../utils/formatNumber';

export default function SupplierMySubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Giả định endpoint lấy danh sách phiếu của supplier hiện tại
        // Nếu chưa có, có thể dùng filter ở frontend hoặc endpoint chung
        apiClient.get('/supplier-submissions/my')
            .then(res => setSubmissions(res.data))
            .catch(err => {
                // Nếu API chưa có, dùng mock data hoặc thông báo
                console.error(err);
                // toast.error('Không thể tải danh sách phiếu');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-600 text-white';
            case 'APPROVED': return 'bg-green-600 text-white';
            case 'REJECTED': return 'bg-red-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Phiếu nhập hàng của tôi</h1>

            {isLoading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : (
                <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                    <table className="min-w-full text-white">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="py-3 px-4 text-left">Ngày tạo</th>
                                <th className="py-3 px-4 text-center">Trạng thái</th>
                                <th className="py-3 px-4 text-center">Tổng giá trị (Xu)</th>
                                <th className="py-3 px-4 text-left">Ghi chú Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {submissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-800">
                                    <td className="py-3 px-4">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">{formatNumber(sub.totalValueCoin)} Xu</td>
                                    <td className="py-3 px-4 text-gray-400 italic">{sub.adminNotes || '---'}</td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                        Bạn chưa tạo phiếu nhập hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
