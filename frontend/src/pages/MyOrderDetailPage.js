// File: frontend/src/pages/MyOrderDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyOrderById } from '../services/orderService.js';
import { formatNumber } from '../utils/formatNumber.js';
import { FaCoins } from 'react-icons/fa';
import { FaDollarSign } from 'react-icons/fa';

const formatStatus = (status) => {
  const styles = {
    PENDING: 'text-yellow-400',
    PREPARING: 'text-blue-400',
    READY_FOR_DELIVERY: 'text-cyan-400',
    COMPLETED: 'text-green-400',
    CANCELLED: 'text-red-400',
  };
  const text = {
    PENDING: 'Đang chờ xử lý',
    PREPARING: 'Đang chuẩn bị',
    READY_FOR_DELIVERY: 'Sẵn sàng giao',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return <span className={`font-bold ${styles[status] || ''}`}>{text[status] || status}</span>;
};

export default function MyOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getMyOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tìm thấy đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) return <p className="text-center text-xl text-gray-300">Đang tải chi tiết đơn hàng...</p>;
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;
  if (!order) return null;

  const totalAmountCoin = parseFloat(order.totalAmountCoin) || 0;
  const totalAmountUsd = parseFloat(order.totalAmountUsd) || 0;
  const subTotalCoin = parseFloat(order.subTotalCoin) || 0;
  const subTotalUsd = parseFloat(order.subTotalUsd) || 0;
  const vipDiscountAmountCoin = parseFloat(order.vipDiscountAmountCoin) || 0;


  return (
    <div className="container mx-auto max-w-4xl bg-gray-900 text-white p-4 md:p-8 min-h-screen">
      <Link to="/my-orders" className="text-pink-400 hover:text-pink-300 mb-6 inline-block">
        &larr; Quay lại Danh sách đơn hàng
      </Link>
      
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Chi tiết Đơn hàng</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400">Mã đơn hàng:</p>
            
            {/* [BẮT ĐẦU SỬA] Ưu tiên hiển thị orderNumber */}
            <p className="text-white font-mono text-xl font-bold text-pink-400">
              {order.orderNumber || 'N/A'}
            </p>
            {/* Hiển thị ID (UUID) nếu không có orderNumber (đơn cũ) */}
            {!order.orderNumber && (
              <p className="text-white font-mono text-xs text-gray-500">
                ID: {order.id}
              </p>
            )}
            {/* [KẾT THÚC SỬA] */}

          </div>
          <div>
            <p className="text-gray-400">Trạng thái:</p>
            <p className="text-xl">{formatStatus(order.status)}</p>
          </div>
          <div>
            <p className="text-gray-400">Ngày đặt:</p>
            <p className="text-white">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          </div>
          <div>
            <p className="text-gray-400">Trạng thái thanh toán:</p>
            <p className={`font-bold text-xl ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-red-400'}`}>
              {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Tên trong game:</p>
            <p className="text-white font-semibold">{order.inGameName}</p>
          </div>
          <div>
            <p className="text-gray-400">Khung giờ nhận:</p>
            <p className="text-white font-semibold">{order.deliveryTimeSlot?.displayText || 'Giao sớm nhất'}</p>
          </div>
        </div>

        {/* ... (Phần Chi tiết vật phẩm và Tổng kết giữ nguyên) ... */}
        <h2 className="text-2xl font-semibold text-white mb-4">Các vật phẩm</h2>
        <div className="space-y-4 border-t border-b border-gray-700 py-4">
          {order.orderDetails.map(detail => (
            <div key={detail.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-4">
                <img 
                  src={detail.item?.thumbnailImageUrl || 'https://placehold.co/64x64/2D3748/FFFFFF?text=Item'}
                  alt={detail.item?.name || 'Vật phẩm'}
                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-white font-semibold">{detail.item?.name || '(Vật phẩm đã bị xóa)'} (x{formatNumber(detail.quantity)})</p>
                  <p className="text-sm text-gray-400">
                    Đơn giá: {formatNumber(detail.priceAtPurchase)} 
                    <span className={detail.currencyAtPurchase === 'USD' ? 'text-green-400' : 'text-yellow-400'}>
                      {' '}{detail.currencyAtPurchase}
                    </span>
                  </p>
                </div>
              </div>
              <p className={`text-lg font-semibold ${detail.currencyAtPurchase === 'USD' ? 'text-green-400' : 'text-yellow-400'}`}>
                {formatNumber(detail.totalLineAmount)} {detail.currencyAtPurchase}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 text-right">
          {subTotalUsd > 0 && (
            <p className="text-lg text-gray-300">
              Tạm tính ($): <span className="font-semibold text-white">{formatNumber(subTotalUsd)} $</span>
            </p>
          )}
          {subTotalCoin > 0 && (
            <p className="text-lg text-gray-300">
              Tạm tính (Xu): <span className="font-semibold text-white">{formatNumber(subTotalCoin)} Xu</span>
            </p>
          )}
          {vipDiscountAmountCoin > 0 && (
            <p className="text-lg text-gray-300">
              Giảm giá VIP (Xu): <span className="font-semibold text-pink-400">-{formatNumber(vipDiscountAmountCoin)} Xu</span>
            </p>
          )}
          <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
            {totalAmountUsd > 0 && (
              <p className="text-2xl font-bold text-white flex justify-end items-center">
                <span className="mr-2">Tổng cộng ($):</span>
                <span className="text-green-400 flex items-center">
                  <FaDollarSign className="mr-1" /> {formatNumber(totalAmountUsd)}
                </span>
              </p>
            )}
            {totalAmountCoin > 0 && (
              <p className="text-2xl font-bold text-white flex justify-end items-center">
                <span className="mr-2">Tổng cộng (Xu):</span>
                <span className="text-yellow-400 flex items-center">
                  <FaCoins className="mr-1" /> {formatNumber(totalAmountCoin)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}