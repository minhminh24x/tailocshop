// File: frontend/src/pages/admin/manager/AdminManageRates.js
// [CODE MỚI]
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllRatesAdmin, updateRateAdmin } from '../../../services/adminCurrencyService.js';
import { formatNumber } from '../../../utils/formatNumber.js';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminManageRates() {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State để chỉnh sửa
  const [editingRateType, setEditingRateType] = useState(null);
  const [currentValue, setCurrentValue] = useState(0);

  // Hàm tải dữ liệu
  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const response = await getAllRatesAdmin();
      setRates(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải tỷ giá');
      toast.error('Không thể tải tỷ giá');
    } finally {
      setIsLoading(false);
    }
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchRates();
  }, []);

  // Bật chế độ chỉnh sửa
  const handleEdit = (rate) => {
    setEditingRateType(rate.rateType);
    setCurrentValue(String(rate.rate)); // [SỬA] Dùng string để tránh NaN
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingRateType(null);
    setCurrentValue('');
  };

  // Lưu thay đổi
  const handleSave = async (rateType) => {
    const parsedValue = parseFloat(currentValue); // [SỬA] Parse khi lưu
    if (isNaN(parsedValue) || parsedValue <= 0) {
      toast.error('Tỷ giá phải là một số dương');
      return;
    }

    const toastId = toast.loading('Đang cập nhật...');
    try {
      await updateRateAdmin(rateType, parsedValue);
      toast.success('Cập nhật thành công!', { id: toastId });
      // Tải lại dữ liệu và thoát chế độ edit
      fetchRates();
      handleCancel();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại', { id: toastId });
    }
  };

  if (isLoading) {
    return <p className="text-gray-400">Đang tải danh sách tỷ giá...</p>;
  }

  if (error) {
    return <p className="text-red-500">Lỗi: {error}</p>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Quản lý Tỷ giá Hối đoái</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 text-white rounded-lg">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-4 py-3 text-left">Loại Tỷ giá (rateType)</th>
              <th className="px-4 py-3 text-left">Giá trị (rate)</th>
              <th className="px-4 py-3 text-left">Người cập nhật</th>
              <th className="px-4 py-3 text-left">Lần cuối cập nhật</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {rates.map((rate) => (
              <tr key={rate.id}>
                {/* Tên Tỷ giá */}
                <td className="px-4 py-3 font-mono text-pink-400">{rate.rateType}</td>

                {/* Giá trị */}
                <td className="px-4 py-3">
                  {editingRateType === rate.rateType ? (
                    // Input khi đang sửa
                    <input
                      type="number"
                      step="any"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)} // [SỬA] Lưu string thay vì parseFloat
                      className="w-full px-2 py-1 bg-gray-900 border border-pink-500 rounded text-white"
                    />
                  ) : (
                    // Hiển thị bình thường
                    <span className="text-xl font-bold text-green-400">{formatNumber(rate.rate)}</span>
                  )}
                </td>

                {/* Người cập nhật */}
                <td className="px-4 py-3 text-gray-300">
                  {rate.updatedBy?.username || 'N/A'}
                </td>

                {/* Thời gian */}
                <td className="px-4 py-3 text-gray-400">
                  {new Date(rate.updatedAt).toLocaleString('vi-VN')}
                </td>

                {/* Hành động */}
                <td className="px-4 py-3 text-center">
                  {editingRateType === rate.rateType ? (
                    // Nút Lưu / Hủy
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleSave(rate.rateType)}
                        className="p-2 bg-green-600 hover:bg-green-500 rounded-full"
                        title="Lưu"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded-full"
                        title="Hủy"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    // Nút Sửa
                    <button
                      onClick={() => handleEdit(rate)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}