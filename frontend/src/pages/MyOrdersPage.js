// File: frontend/src/pages/MyOrdersPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService.js';
import { formatNumber } from '../utils/formatNumber.js';
import { FaCoins, FaDollarSign } from 'react-icons/fa';

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
  return <span className={`font-semibold ${styles[status] || ''}`}>{text[status] || status}</span>;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => { 
      try {
        setIsLoading(true);
        const { data } = await getMyOrders(); 
        setOrders(data); 
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []); 
  
  if (isLoading) return <p className="text-center text-xl text-gray-300">Đang tải đơn hàng của bạn...</p>;
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;
  
  return (
    <div className="container mx-auto max-w-4xl bg-gray-900 text-white p-4 md:p-8 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">Đơn hàng của tôi</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-400 text-center">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const totalCoin = parseFloat(order.totalAmountCoin) || 0;
            const totalUsd = parseFloat(order.totalAmountUsd) || 0;

            return (
              <Link 
                to={`/my-orders/${order.id}`} // Link vẫn dùng UUID (id)
                key={order.id} 
                className="block bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  
                  {/* [BẮT ĐẦU SỬA] Ưu tiên hiển thị orderNumber */}
                  <p className="font-mono text-sm text-pink-400 font-bold">
                    Mã ĐH: {order.orderNumber || order.id.split('-')[0] + '...'}
                  </p>
                  {/* [KẾT THÚC SỬA] */}
                  
                  <p>{formatStatus(order.status)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-300">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  
                  <div className="text-right">
                    {totalUsd > 0 && (
                      <p className="font-semibold text-green-400 flex items-center justify-end">
                        <FaDollarSign className="mr-1" size={16} /> {formatNumber(totalUsd)}
                      </p>
                    )}
                    {totalCoin > 0 && (
                      <p className="font-semibold text-yellow-400 flex items-center justify-end">
                        <FaCoins className="mr-1" size={16} /> {formatNumber(totalCoin)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}