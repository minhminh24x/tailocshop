// File: frontend/src/pages/admin/manager/AdminManageSubmissions.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../../../services/supplierSubmissionService';

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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Nhập kho</h1>
      
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)} //
          className="ml-2 p-2 border rounded-lg bg-white"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Đang chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Ngày tạo</th>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Tổng giá trị (Coin)</th>
                <th className="p-4 text-left">Người duyệt</th>
                <th className="p-4 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{sub.supplier?.inGameName || 'N/A'}</td>
                  <td className="p-4">{sub.status}</td>
                  <td className="p-4">{sub.totalValueCoin}</td>
                  <td className="p-4">{sub.approvedBy?.inGameName || 'N/A'}</td>
                  <td className="p-4">
                    <Link
                      to={`/admin/submission/${sub.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {sub.status === 'PENDING' ? 'Duyệt phiếu' : 'Xem'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}