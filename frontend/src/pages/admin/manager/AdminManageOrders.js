// File: frontend/src/pages/admin/manager/AdminManageOrders.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrdersAdmin } from '../../../services/adminOrderService.js';
import { formatNumber } from '../../../utils/formatNumber.js';
import { FaCoins, FaDollarSign } from 'react-icons/fa';

export default function AdminManageOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { data } = await getAllOrdersAdmin();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-600 text-yellow-100';
      case 'COMPLETED': return 'bg-green-600 text-green-100';
      case 'CANCELLED': return 'bg-red-600 text-red-100';
      case 'PREPARING': return 'bg-blue-600 text-blue-100';
      case 'READY_FOR_DELIVERY': return 'bg-cyan-600 text-cyan-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const getPaymentStatusClass = (status) => {
    return status === 'PAID' ? 'text-green-400' : 'text-red-400';
  };

  if (isLoading) return <p className="text-center text-lg text-gray-300">Đang tải đơn hàng...</p>;
  if (error) return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;

  return (
    <div className="bg-gray-900 shadow-xl rounded-lg p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Quản lý Đơn hàng</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mã ĐH</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Khách hàng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày đặt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tổng cộng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Thanh toán</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {orders.map(order => {
              const totalCoin = parseFloat(order.totalAmountCoin) || 0;
              const totalUsd = parseFloat(order.totalAmountUsd) || 0;
              
              return (
                <tr 
                  key={order.id} 
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="hover:bg-gray-800 cursor-pointer"
                >
                  {/* [BẮT ĐẦU SỬA] Ưu tiên hiển thị orderNumber */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-400">
                    {order.orderNumber || order.id.substring(0, 8)}
                  </td>
                  {/* [KẾT THÚC SỬA] */}
                  
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.customer?.inGameName || order.inGameName || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                    {totalUsd > 0 && (
                      <span className="flex items-center justify-end text-green-400">
                        <FaDollarSign size={14} className="mr-1" /> {formatNumber(totalUsd)}
                      </span>
                    )}
                    {totalCoin > 0 && (
                      <span className="flex items-center justify-end text-yellow-400">
                        <FaCoins size={14} className="mr-1" /> {formatNumber(totalCoin)}
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${getPaymentStatusClass(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}