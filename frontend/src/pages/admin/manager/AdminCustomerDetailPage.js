// File: frontend/src/pages/admin/manager/AdminCustomerDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserDetail } from '../../../services/adminUserService';

// Hàm format tiền
const formatCoin = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' Coin';

export default function AdminCustomerDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getUserDetail(userId);
        setUser(data);
      } catch (error) {
        toast.error('Lỗi khi tải chi tiết user');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [userId]);

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (!user) return <p className="p-6">Không tìm thấy user.</p>;

  return (
    <div className="p-6">
      <Link to="/admin/manage-customers" className="text-blue-600 hover:underline mb-4 block">&larr; Quay lại danh sách</Link>
      
      {/* Thông tin chính */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 text-gray-900">
        <h1 className="text-3xl font-bold">{user.inGameName}</h1>
        <p className="text-gray-600">{user.email}</p>
        <p className="mt-2">
          <span className="font-semibold">Cấp VIP:</span> {user.vipLevel.name} (Level {user.vipLevel.level})
        </p>
        <p>
          <span className="font-semibold">Tổng chi tiêu:</span> {formatCoin(user.totalSpentCoin)}
        </p>
        <p>
          <span className="font-semibold">Ngày tham gia:</span> {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* 20 Đơn hàng gần nhất */}
      <div className="bg-white shadow rounded-lg p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-4">20 Đơn hàng gần nhất</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Mã đơn</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Thanh toán</th>
                <th className="p-4 text-left">Tổng Coin</th>
                <th className="p-4 text-left">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="p-4">
                     <Link to={`/admin/order/${order.id}`} className="text-blue-600 hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">{order.status}</td>
                  <td className="p-4">{order.paymentStatus}</td>
                  <td className="p-4">{formatCoin(order.totalAmountCoin)}</td>
                  <td className="p-4">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {user.orders.length === 0 && <p className="p-4">Chưa có đơn hàng nào.</p>}
        </div>
      </div>
    </div>
  );
}