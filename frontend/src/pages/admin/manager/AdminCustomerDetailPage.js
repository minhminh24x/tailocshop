// File: frontend/src/pages/admin/manager/AdminCustomerDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUserDetail } from '../../../services/adminUserService';
import { FaCoins, FaCheckCircle, FaBoxOpen, FaClock } from 'react-icons/fa';
import { formatNumber } from '../../../utils/formatNumber';

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

  if (loading) return <p className="p-6 text-gray-300">Đang tải...</p>;
  if (!user) return <p className="p-6 text-gray-300">Không tìm thấy user.</p>;

  const isCustomer = user.role === 'CUSTOMER';
  const isStaff = user.role === 'STAFF';
  const isSupplier = user.role === 'SUPPLIER';

  // Tính số đơn đã xử lý (cho Staff)
  const handledOrdersCount = user.handledOrders?.length || 0;
  const completedHandledOrders = user.handledOrders?.filter(o => o.status === 'COMPLETED') || [];
  const totalRevenue = completedHandledOrders.reduce((sum, o) => sum + parseFloat(o.totalAmountCoin || 0), 0);

  // Tính số phiếu đã duyệt (cho Supplier)
  const approvedSubmissions = user.supplierSubmissions?.filter(s => s.status === 'APPROVED') || [];
  const totalItemsSubmitted = approvedSubmissions.reduce((sum, s) => {
    // Tính tổng số lượng từ các details
    const detailQty = s.details?.reduce((dSum, d) => dSum + d.quantity, 0) || 0;
    return sum + detailQty;
  }, 0);

  return (
    <div className="p-6">
      <Link to="/admin/manage-users" className="text-pink-400 hover:text-pink-300 mb-4 block">
        ← Quay lại danh sách
      </Link>

      {/* Thông tin chính */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-white">{user.inGameName}</h1>
        <p className="text-gray-400">{user.email}</p>
        <div className="mt-4 space-y-2">
          <p className="text-gray-300">
            <span className="text-gray-400">Cấp VIP:</span>{' '}
            <span className="text-blue-400">{user.vipLevel?.name || 'N/A'}</span>{' '}
            <span className="text-gray-500">(Level {user.vipLevel?.level || 0})</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Tổng chi tiêu:</span>{' '}
            <span className="text-yellow-400 font-bold">{formatNumber(user.totalSpentCoin)} Coin</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Ngày tham gia:</span>{' '}
            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>

      {/* CUSTOMER: Hiện lịch sử đơn hàng */}
      {isCustomer && (
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Lịch sử đơn hàng</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="p-4 text-left text-gray-300">Mã đơn</th>
                  <th className="p-4 text-left text-gray-300">Trạng thái</th>
                  <th className="p-4 text-left text-gray-300">Thanh toán</th>
                  <th className="p-4 text-left text-gray-300">Tổng Coin</th>
                  <th className="p-4 text-left text-gray-300">Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {(user.orders || []).map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-slate-700/50">
                    <td className="p-4">
                      <Link to={`/admin/order/${order.id}`} className="text-pink-400 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-300">{order.status}</td>
                    <td className="p-4 text-gray-300">{order.paymentStatus}</td>
                    <td className="p-4 text-yellow-400">{formatNumber(order.totalAmountCoin)} <FaCoins className="inline text-yellow-500" /></td>
                    <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!user.orders || user.orders.length === 0) && (
              <p className="p-4 text-gray-500 text-center">Chưa có đơn hàng nào.</p>
            )}
          </div>
        </div>
      )}

      {/* STAFF: Hiện số đơn đã xử lý và doanh thu */}
      {isStaff && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Đơn hàng đã xử lý</p>
                <p className="text-4xl font-bold text-white mt-2">{handledOrdersCount}</p>
                <p className="text-green-400 text-sm mt-1">{completedHandledOrders.length} đã hoàn thành</p>
              </div>
              <FaCheckCircle className="text-5xl text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/30 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Doanh thu từ đơn COMPLETED</p>
                <p className="text-4xl font-bold text-white mt-2 flex items-center gap-2">
                  <FaCoins className="text-yellow-400" />
                  {formatNumber(totalRevenue)}
                </p>
                <p className="text-yellow-400 text-sm mt-1">Coin</p>
              </div>
              <FaClock className="text-5xl text-yellow-400 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER: Hiện số phiếu đã duyệt */}
      {isSupplier && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Phiếu nhập đã duyệt</p>
                <p className="text-4xl font-bold text-white mt-2">{approvedSubmissions.length}</p>
                <p className="text-green-400 text-sm mt-1">tổng số phiếu APPROVED</p>
              </div>
              <FaCheckCircle className="text-5xl text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Tổng số lượng hàng đã nhập</p>
                <p className="text-4xl font-bold text-white mt-2 flex items-center gap-2">
                  <FaBoxOpen className="text-purple-400" />
                  {formatNumber(totalItemsSubmitted)}
                </p>
                <p className="text-purple-400 text-sm mt-1">items</p>
              </div>
              <FaBoxOpen className="text-5xl text-purple-400 opacity-50" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}