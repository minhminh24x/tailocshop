// File: frontend/src/pages/admin/manager/AdminManageSubmissions.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../../../services/supplierSubmissionService';
import { formatNumber } from '../../../utils/formatNumber';

export default function AdminManageSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); // PENDING, APPROVED, REJECTED

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await getSubmissions(statusFilter);
        setSubmissions(data);
      } catch (error) {
        toast.error('Lỗi khi tải danh sách phiếu nhập');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-600 text-white';
      case 'APPROVED': return 'bg-green-600 text-white';
      case 'REJECTED': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Quản lý Nhập kho</h1>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-300 mr-3">Lọc theo trạng thái:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Đang chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
          <table className="min-w-full text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-left">Ngày tạo</th>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Tổng giá trị (Xu)</th>
                <th className="p-4 text-left">Người duyệt</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-800">
                  <td className="p-4 text-sm text-gray-300">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{sub.supplier?.inGameName || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-yellow-400">
                    {formatNumber(sub.totalValueCoin)}
                  </td>
                  <td className="p-4 text-sm text-gray-400">{sub.approvedBy?.inGameName || '---'}</td>
                  <td className="p-4 text-center">
                    <Link
                      to={`/admin/submissions/${sub.id}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium"
                    >
                      {sub.status === 'PENDING' ? 'Duyệt phiếu' : 'Xem chi tiết'}
                    </Link>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Không có phiếu nhập nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}