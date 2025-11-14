// File: frontend/src/pages/admin/manager/AdminSubmissionDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSubmissionById, approveSubmission, rejectSubmission } from '../../../services/supplierSubmissionService';

export default function AdminSubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dùng state để admin điều chỉnh giá
  const [finalPrices, setFinalPrices] = useState({});
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
        // Khởi tạo state giá chốt
        const initialPrices = {};
        data.supplierSubmissionDetails.forEach(detail => {
          initialPrices[detail.id] = detail.finalPricePerUnitCoin > 0
            ? detail.finalPricePerUnitCoin
            : detail.suggestedPricePerUnitCoin; // Mặc định lấy giá đề xuất
        });
        setFinalPrices(initialPrices);
        setAdminNotes(data.adminNotes || '');
      } catch (error) {
        toast.error('Lỗi khi tải chi tiết phiếu');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handlePriceChange = (detailId, value) => {
    setFinalPrices(prev => ({ ...prev, [detailId]: value }));
  };
  
  const isPending = submission?.status === 'PENDING';

  const handleApprove = async () => {
    // Chuẩn bị data cho API
    const approvalData = {
      adminNotes,
      finalPrices: Object.keys(finalPrices).map(detailId => ({
        detailId,
        finalPricePerUnitCoin: finalPrices[detailId]
      }))
    };
    
    if (!window.confirm('Bạn chắc chắn muốn duyệt phiếu này? Kho sẽ được cập nhật.')) return;

    try {
      await approveSubmission(id, approvalData);
      toast.success('Duyệt phiếu thành công! Kho đã cập nhật.');
      navigate('/admin/manage-submissions');
    } catch (error) {
      toast.error(error.message || 'Duyệt phiếu thất bại');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Bạn chắc chắn muốn từ chối phiếu này?')) return;
    try {
      await rejectSubmission(id, { adminNotes });
      toast.info('Đã từ chối phiếu.');
      navigate('/admin/manage-submissions');
    } catch (error) {
      toast.error(error.message || 'Từ chối phiếu thất bại');
    }
  };

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (!submission) return <p className="p-6">Không tìm thấy phiếu.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chi tiết phiếu nhập (ID: ...{id.slice(-6)})</h1>
      
      {/* Thông tin phiếu */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <p><span className="font-semibold">Supplier:</span> {submission.supplier.inGameName}</p>
        <p><span className="font-semibold">Trạng thái:</span> {submission.status}</p>
        <p><span className="font-semibold">Ghi chú (Supplier):</span> {submission.supplierNotes || 'Không có'}</p>
      </div>

      {/* Chi tiết vật phẩm */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Chi tiết vật phẩm</h2>
        {submission.supplierSubmissionDetails.map(detail => (
          <div key={detail.id} className="grid grid-cols-4 gap-4 items-center mb-4 border-b pb-4">
            <div>
              <p className="font-semibold">{detail.item.name}</p>
              <p className="text-sm text-gray-600">SL: {detail.quantity} {detail.unit}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Giá đề xuất</label>
              <p>{detail.suggestedPricePerUnitCoin} Coin</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Giá chốt (Admin)</label>
              <input
                type="number"
                disabled={!isPending}
                value={finalPrices[detail.id] || 0}
                onChange={(e) => handlePriceChange(detail.id, e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tổng</label>
              <p>{(finalPrices[detail.id] || 0) * detail.quantity} Coin</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin duyệt */}
      {isPending && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Duyệt phiếu</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ghi chú (Admin)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Duyệt & Nhập kho
            </button>
            <button
              onClick={handleReject}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Từ chối
            </button>
          </div>
        </div>
      )}
    </div>
  );
}