// File: frontend/src/pages/admin/manager/AdminManageOrders.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrdersAdmin } from '../../../services/adminOrderService.js';

// Hàm helper định dạng tiền tệ
const formatCurrency = (amount, currency) => {
  return `${parseFloat(amount).toFixed(2)} ${currency}`;
};

// Hàm helper cho màu sắc status
const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-600 text-yellow-100';
    case 'PREPARING': return 'bg-blue-600 text-blue-100';
    case 'COMPLETED': return 'bg-green-600 text-green-100';
    case 'CANCELLED': return 'bg-red-600 text-red-100';
    default: return 'bg-gray-600 text-gray-100';
  }
};

export default function AdminManageOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getAllOrdersAdmin();
      setOrders(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = (orderId) => {
    // Chuyển hướng đến trang chi tiết (sẽ tạo ở Bước 4)
    navigate(`/admin/orders/${orderId}`);
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-300">Đang tải đơn hàng...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Quản lý Đơn hàng</h1>

      <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Ngày Đặt</th>
              <th className="py-3 px-4 text-left">Khách hàng (IGN)</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-right">Tổng Tiền</th>
              <th className="py-3 px-4 text-center">Thanh toán</th>
              <th className="py-3 px-4 text-center">Trạng thái ĐH</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-700">
                <td className="py-3 px-4 text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </td>
                <td className="py-3 px-4 font-medium">{order.customer?.inGameName || order.inGameName}</td>
                <td className="py-3 px-4 text-gray-400">{order.customer?.email || 'N/A'}</td>
                <td className="py-3 px-4 text-right font-mono text-green-400">
                  {formatCurrency(order.totalAmount, order.currencyUsed)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.paymentStatus === 'PAID' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md"
                  >
                    Xem / Sửa
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 px-4 text-center text-gray-400">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}