// File: frontend/src/pages/admin/manager/AdminOrderDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getOrderByIdAdmin,
  updateOrderAdmin,
  advanceOrderStatus,
  confirmPaymentAndComplete,
  ORDER_STATUS_LABELS,
  getNextStatus
} from '../../../services/adminOrderService.js';
import { formatNumber } from '../../../utils/formatNumber.js';
import { FaCoins, FaDollarSign, FaCheck, FaTimes, FaArrowRight, FaClock, FaCreditCard } from 'react-icons/fa';
import OrderStatusStepper from '../../../components/order/OrderStatusStepper.js';
import CancelOrderModal from '../../../components/staff/CancelOrderModal.js';

export default function AdminOrderDetailPage() {
  const { orderId: id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getOrderByIdAdmin(id);
      setOrder(data);
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

  // [MỚI] Chuyển sang bước tiếp theo
  const handleAdvanceStatus = async () => {
    setIsUpdating(true);
    try {
      await advanceOrderStatus(id);
      toast.success('Chuyển trạng thái thành công!');
      fetchOrderDetails();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật thất bại';
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // [MỚI] Xác nhận thanh toán và hoàn thành
  const handleConfirmComplete = async () => {
    setIsUpdating(true);
    try {
      await confirmPaymentAndComplete(id);
      toast.success('Đã xác nhận thanh toán và hoàn thành đơn hàng!');
      fetchOrderDetails();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật thất bại';
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // [SỬa] Hủy đơn hàng với lý do
  const handleCancelOrder = async (reason) => {
    setIsUpdating(true);
    try {
      await updateOrderAdmin(id, { status: 'CANCELLED', cancelReason: reason });
      toast.success('Đã hủy đơn hàng!');
      setShowCancelModal(false);
      fetchOrderDetails();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Hủy đơn thất bại';
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // [MỚI] Xác nhận đã thanh toán
  const handleConfirmPayment = async () => {
    setIsUpdating(true);
    try {
      await updateOrderAdmin(id, { paymentStatus: 'PAID' });
      toast.success('Đã xác nhận thanh toán!');
      fetchOrderDetails();
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

  const totalAmountCoin = parseFloat(order.totalAmountCoin) || 0;
  const totalAmountUsd = parseFloat(order.totalAmountUsd) || 0;
  const subTotalCoin = parseFloat(order.subTotalCoin) || 0;
  const subTotalUsd = parseFloat(order.subTotalUsd) || 0;
  const vipDiscountAmountCoin = parseFloat(order.vipDiscountAmountCoin) || 0;

  const nextStatus = getNextStatus(order.status);
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';
  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div>
      <button onClick={() => navigate('/admin/orders')} className="mb-4 text-pink-400 hover:text-pink-300">
        &larr; Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-gray-900 shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Chi tiết Đơn hàng (Admin)</h1>

          <p className="font-mono text-xl font-bold text-pink-400 mb-2">
            Mã ĐH: {order.orderNumber || 'N/A'}
          </p>
          <p className="font-mono text-xs text-gray-500 mb-6">UUID: {order.id}</p>

          {/* Thông tin Khách hàng */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-pink-500 mb-3">Khách hàng</h2>
            <p><strong>In-Game Name:</strong> {order.inGameName}</p>
            <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
            <p><strong>VIP Cấp:</strong> {order.customer?.vipLevelInt || 0}</p>
            <p><strong>Khung giờ:</strong> {order.deliveryTimeSlot?.displayText || 'Giao sớm nhất'}</p>
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
                      <p className="text-gray-400 text-sm">
                        SL: {formatNumber(detail.quantity)} ({detail.unitAtPurchase})
                        @ {formatNumber(detail.priceAtPurchase)} {detail.currencyAtPurchase}
                      </p>
                    </div>
                  </div>
                  <p className={`text-white font-medium ${detail.currencyAtPurchase === 'USD' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {formatNumber(detail.totalLineAmount)} {detail.currencyAtPurchase}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng kết */}
          <div className="text-right space-y-2">
            {subTotalUsd > 0 && (
              <p className="text-lg text-gray-300">Tạm tính ($): <span className="font-semibold text-white">{formatNumber(subTotalUsd)} $</span></p>
            )}
            {subTotalCoin > 0 && (
              <p className="text-lg text-gray-300">Tạm tính (Xu): <span className="font-semibold text-white">{formatNumber(subTotalCoin)} Xu</span></p>
            )}
            {vipDiscountAmountCoin > 0 && (
              <p className="text-lg text-gray-300">Giảm giá VIP (Xu): <span className="font-semibold text-pink-400">-{formatNumber(vipDiscountAmountCoin)} Xu</span></p>
            )}

            <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
              {totalAmountUsd > 0 && (
                <p className="text-2xl font-bold text-white flex justify-end items-center">
                  <span className="mr-2">Tổng ($):</span>
                  <span className="text-green-400 flex items-center">
                    <FaDollarSign className="mr-1" /> {formatNumber(totalAmountUsd)}
                  </span>
                </p>
              )}
              {totalAmountCoin > 0 && (
                <p className="text-2xl font-bold text-white flex justify-end items-center">
                  <span className="mr-2">Tổng (Xu):</span>
                  <span className="text-yellow-400 flex items-center">
                    <FaCoins className="mr-1" /> {formatNumber(totalAmountCoin)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cột 2: Panel Tiến trình & Hành động */}
        <div className="lg:col-span-1 space-y-6">

          {/* [MỚI] Step-by-step Stepper */}
          <OrderStatusStepper
            currentStatus={order.status}
            isCancelled={isCancelled}
            onAdvanceStep={handleAdvanceStatus}
            isUpdating={isUpdating}
            canAdvance={!isCancelled && !isCompleted}
          />

          {/* Panel Thanh toán & Hành động */}
          {!isCompleted && !isCancelled && (
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaCreditCard />
                Thanh toán
              </h3>

              {/* Trạng thái thanh toán */}
              <div className={`p-4 rounded-lg mb-4 ${isPaid ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'
                }`}>
                <p className={`text-lg font-bold ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                  {isPaid ? '✅ Đã thanh toán' : '❌ Chưa thanh toán'}
                </p>
              </div>

              <div className="space-y-3">
                {/* Nút xác nhận thanh toán - CHỈ khi READY_FOR_DELIVERY */}
                {!isPaid && order.status === 'READY_FOR_DELIVERY' && (
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Xác nhận đã thanh toán
                  </button>
                )}

                {/* Thông báo nếu chưa đến bước thanh toán */}
                {!isPaid && order.status !== 'READY_FOR_DELIVERY' && (
                  <p className="text-sm text-gray-400 text-center italic">
                    Chuyển đến "Sẵn sàng giao" để xác nhận thanh toán
                  </p>
                )}

                {/* Nút hoàn thành (cần thanh toán trước) */}
                {isPaid && nextStatus === 'COMPLETED' && (
                  <button
                    onClick={handleAdvanceStatus}
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Hoàn thành đơn hàng
                  </button>
                )}

                {/* Nút thanh toán + hoàn thành nhanh */}
                {!isPaid && order.status === 'READY_FOR_DELIVERY' && (
                  <button
                    onClick={handleConfirmComplete}
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Thanh toán & Hoàn thành ngay
                  </button>
                )}

                {/* Nút hủy */}
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={isUpdating}
                  className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaTimes /> Hủy đơn hàng
                </button>
              </div>
            </div>
          )}

          {/* Thông tin người xử lý */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">
              <FaClock className="inline mr-1" />
              Người xử lý: <span className="text-white">{order.staff?.inGameName || 'Chưa có'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cập nhật: {new Date(order.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* [MỚI] Modal hủy đơn hàng */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        orderNumber={order?.orderNumber}
        isLoading={isUpdating}
      />
    </div>
  );
}