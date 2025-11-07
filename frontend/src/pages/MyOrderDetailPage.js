// File: frontend/src/pages/MyOrderDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMyOrderById } from '../services/orderService.js';

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

  if (isLoading) return <p className="text-center text-xl">Đang tải chi tiết đơn hàng...</p>;
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Chi tiết Đơn hàng</h1>
      
      {/* Thông tin chung */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-400">Mã đơn hàng:</p>
          <p className="text-white font-mono text-sm">{order.id}</p>
        </div>
        <div>
          <p className="text-gray-400">Trạng thái:</p>
          <p className="text-xl font-bold text-yellow-400">{order.status}</p>
        </div>
        <div>
          <p className="text-gray-400">Ngày đặt:</p>
          <p className="text-white">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        </div>
        <div>
          <p className="text-gray-400">Trạng thái thanh toán:</p>
          <p className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-red-400'}`}>
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* Chi tiết vật phẩm */}
      <h2 className="text-2xl font-semibold text-white mb-4">Các vật phẩm</h2>
      <div className="space-y-3 border-t border-b border-gray-700 py-4">
        {order.orderDetails.map(detail => (
          <div key={detail.id} className="flex justify-between items-center">
            <div>
              <p className="text-white font-semibold">{detail.item.name} (x{detail.quantity})</p>
              <p className="text-sm text-gray-400">Đơn giá: {detail.priceAtPurchase} {order.currencyUsed}</p>
            </div>
            <p className="text-lg text-white">{detail.totalLineAmount} {order.currencyUsed}</p>
          </div>
        ))}
      </div>

      {/* Tổng kết */}
      <div className="mt-6 space-y-2 text-right">
        <p className="text-lg text-gray-300">
          Tạm tính: <span className="font-semibold text-white">{order.subTotal} {order.currencyUsed}</span>
        </p>
        <p className="text-lg text-gray-300">
          Giảm giá VIP: <span className="font-semibold text-pink-400">-{order.vipDiscountAmount} {order.currencyUsed}</span>
        </p>
        <p className="text-2xl font-bold text-white">
          Tổng cộng: <span className="text-green-400">{order.totalAmount} {order.currencyUsed}</span>
        </p>
      </div>
    </div>
  );
}