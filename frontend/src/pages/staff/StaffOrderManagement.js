// File: frontend/src/pages/staff/StaffOrderManagement.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient'; // Giả định dùng chung apiClient
import { formatNumber } from '../../utils/formatNumber';

export default function StaffOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Hàm tải đơn hàng
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // Gọi API admin với filter status pending/preparing để lấy đơn cần xử lý
            const response = await apiClient.get('/orders/admin', {
                params: { limit: 100 } // Lấy nhiều đơn hàng để staff xử lý
            });
            // [FIX] API giờ trả về { data: [...], pagination: {...} }
            setOrders(response.data.data || []);
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Cập nhật trạng thái thành: ${newStatus}`);
            fetchOrders(); // Reload
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    // Lọc đơn hàng theo tab
    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'ALL') return true;
        return order.status === filterStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-600 text-white';
            case 'PREPARING': return 'bg-blue-600 text-white';
            case 'READY_FOR_DELIVERY': return 'bg-purple-600 text-white';
            case 'COMPLETED': return 'bg-green-600 text-white';
            case 'CANCELLED': return 'bg-red-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Quản lý Đơn hàng (Staff)</h1>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {['ALL', 'PENDING', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${filterStatus === status
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {status === 'ALL' ? 'Tất cả' : status}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : (
                <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                    <table className="min-w-full text-white">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="py-3 px-4 text-left">Mã Đơn</th>
                                <th className="py-3 px-4 text-left">Khách hàng</th>
                                <th className="py-3 px-4 text-center">Tổng tiền</th>
                                <th className="py-3 px-4 text-center">Trạng thái</th>
                                <th className="py-3 px-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-800">
                                    <td className="py-3 px-4 font-mono text-sm">{order.orderNumber || order.id.slice(0, 8)}...</td>
                                    <td className="py-3 px-4">{order.inGameName}</td>
                                    <td className="py-3 px-4 text-center">
                                        {order.totalAmountUsd > 0
                                            ? `$${formatNumber(order.totalAmountUsd)}`
                                            : `${formatNumber(order.totalAmountCoin)} Xu`
                                        }
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {order.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Nhận đơn
                                            </button>
                                        )}
                                        {order.status === 'PREPARING' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'READY_FOR_DELIVERY')}
                                                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Xong
                                            </button>
                                        )}
                                        {order.status === 'READY_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Hoàn tất
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        Không có đơn hàng nào.
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
