// File: frontend/src/pages/admin/manager/AdminManageOrders.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrdersAdmin } from '../../../services/adminOrderService.js';
import { formatNumber } from '../../../utils/formatNumber.js';
import { FaCoins, FaDollarSign, FaSearch } from 'react-icons/fa';
import Pagination from '../../../components/common/Pagination.js';

export default function AdminManageOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // [NÂNG CẤP] Server-side Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // [NÂNG CẤP] Fetch với server-side pagination
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Chỉ thêm filter nếu không phải 'ALL'
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (paymentFilter && paymentFilter !== 'ALL') {
        params.paymentStatus = paymentFilter;
      }

      const { data: response } = await getAllOrdersAdmin(params);

      // [FIX] API giờ trả về { data: [...], pagination: {...} }
      setOrders(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset về trang 1 khi thay đổi filter
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePaymentFilterChange = (e) => {
    setPaymentFilter(e.target.value);
    setCurrentPage(1);
  };

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
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">
          Quản lý Đơn hàng
          <span className="text-lg font-normal text-gray-400 ml-2">({totalItems} đơn)</span>
        </h1>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PREPARING">Đang chuẩn bị</option>
            <option value="READY_FOR_DELIVERY">Sẵn sàng giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={handlePaymentFilterChange}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Tất cả Thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="UNPAID">Chưa thanh toán</option>
          </select>
        </div>
      </div>

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
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-400">
                    {order.orderNumber || order.id.substring(0, 8)}
                  </td>
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
                    {order.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}