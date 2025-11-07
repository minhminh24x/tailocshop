// File: frontend/src/pages/admin/manager/AdminOrderDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrderByIdAdmin, updateOrderAdmin } from '../../../services/adminOrderService.js';
import { useAuthStore } from '../../../store/authStore.js';

// Lấy từ schema.prisma
const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
const PAYMENT_STATUSES = ['UNPAID', 'PAID'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const adminUser = useAuthStore((state) => state.user);

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho việc cập nhật
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Hàm tải dữ liệu chi tiết
  const fetchOrderDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getOrderByIdAdmin(id);
      setOrder(data);
      // Set state ban đầu cho dropdown
      setCurrentStatus(data.status);
      setCurrentPaymentStatus(data.paymentStatus);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải chi tiết đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Hàm xử lý cập nhật
  const handleUpdateOrder = async () => {
    if (currentStatus === order.status && currentPaymentStatus === order.paymentStatus) {
      toast.error('Bạn chưa thay đổi trạng thái nào.');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        status: currentStatus,
        paymentStatus: currentPaymentStatus,
      };
      await updateOrderAdmin(id, updateData);
      toast.success('Cập nhật đơn hàng thành công!');
      fetchOrderDetails(); // Tải lại dữ liệu mới
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật thất bại';
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-300">Đang tải chi tiết đơn hàng...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;
  }

  if (!order) {
    return null;
  }

  return (
    <div>
      <button onClick={() => navigate('/admin/orders')} className="mb-4 text-pink-400 hover:text-pink-300">
        &larr; Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột 1: Chi tiết & Cập nhật */}
        <div className="lg:col-span-2 bg-gray-900 shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Chi tiết Đơn hàng</h1>
          <p className="font-mono text-sm text-gray-400 mb-6">{order.id}</p>

          {/* Thông tin Khách hàng */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-pink-500 mb-3">Khách hàng</h2>
            <p><strong>In-Game Name:</strong> {order.inGameName}</p>
            <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
            <p><strong>VIP Cấp:</strong> {order.customer?.vipLevelInt || 0}</p>
          </div>

          {/* Chi tiết vật phẩm */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-pink-500 mb-3">Vật phẩm đã đặt</h2>
            <div className="space-y-3 border-t border-b border-gray-700 py-4">
              {order.orderDetails.map(detail => (
                <div key={detail.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={detail.item?.thumbnailImageUrl || 'https://placehold.co/64x64/2D3748/FFFFFF?text=Item'} 
                      alt={detail.item?.name || 'Vật phẩm đã bị xóa'} 
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">{detail.item?.name || '(Vật phẩm đã bị xóa)'}</p>
                      <p className="text-gray-400 text-sm">SL: {detail.quantity} ({detail.unitAtPurchase})</p>
                    </div>
                  </div>
                  <p className="text-white font-medium">
                    {(detail.priceAtPurchase * detail.quantity).toFixed(2)} {order.currencyUsed}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tổng kết */}
          <div className="text-right space-y-2">
            <p className="text-lg text-gray-300">Tạm tính: <span className="font-semibold text-white">{order.subTotal} {order.currencyUsed}</span></p>
            <p className="text-lg text-gray-300">Giảm giá VIP: <span className="font-semibold text-pink-400">-{order.vipDiscountAmount} {order.currencyUsed}</span></p>
            <p className="text-2xl font-bold text-white">Tổng cộng: <span className="text-green-400">{order.totalAmount} {order.currencyUsed}</span></p>
          </div>
        </div>

        {/* Cột 2: Panel Hành động */}
        <div className="lg:col-span-1 bg-gray-900 shadow-xl rounded-lg p-6 h-fit">
          <h2 className="text-2xl font-semibold text-white mb-4">Hành động</h2>
          
          <div className="mb-4">
            <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-300 mb-2">Trạng thái Đơn hàng</label>
            <select
              id="orderStatus"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-300 mb-2">Trạng thái Thanh toán</label>
            <select
              id="paymentStatus"
              value={currentPaymentStatus}
              onChange={(e) => setCurrentPaymentStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {PAYMENT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUpdateOrder}
            disabled={isUpdating}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-600"
          >
            {isUpdating ? 'Đang cập nhật...' : 'Lưu Thay đổi'}
          </button>

          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Người xử lý: {order.staff?.inGameName || (isUpdating ? adminUser.inGameName : 'Chưa có')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}