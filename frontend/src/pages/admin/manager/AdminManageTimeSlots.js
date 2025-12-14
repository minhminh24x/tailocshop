// File: frontend/src/pages/admin/manager/AdminManageTimeSlots.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getAllTimeSlotsAdmin,
  createTimeSlotAdmin,
  updateTimeSlotAdmin,
  deleteTimeSlotAdmin
} from '../../../services/adminTimeSlotService.js';
import TimeSlotModal from '../../../components/admin/TimeSlotModal.js';

export default function AdminManageTimeSlots() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeSlotToEdit, setTimeSlotToEdit] = useState(null);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getAllTimeSlotsAdmin();
      // Lọc bỏ slot MẶC ĐỊNH khỏi UI quản lý
      setTimeSlots(data.filter(slot => slot.id !== "00000000-0000-0000-0000-000000000000"));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách khung giờ';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  // === Xử lý Modal ===
  const handleOpenCreateModal = () => {
    setTimeSlotToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (timeSlot) => {
    setTimeSlotToEdit(timeSlot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeSlotToEdit(null);
  };

  // === Xử lý CRUD ===
  const handleSaveTimeSlot = async (timeSlotData) => {
    try {
      if (timeSlotToEdit) {
        await updateTimeSlotAdmin(timeSlotToEdit.id, timeSlotData);
        toast.success('Cập nhật khung giờ thành công!');
      } else {
        await createTimeSlotAdmin(timeSlotData);
        toast.success('Tạo khung giờ mới thành công!');
      }
      handleCloseModal();
      fetchTimeSlots(); // Tải lại danh sách
    } catch (err) {
      const errorMsg = err.response?.data?.errors ? err.response.data.errors.join(', ') : (err.response?.data?.message || 'Thao tác thất bại');
      toast.error(errorMsg);
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) {
      try {
        await deleteTimeSlotAdmin(id);
        toast.success('Xóa khung giờ thành công!');
        fetchTimeSlots(); // Tải lại danh sách
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể xóa khung giờ';
        toast.error(errorMsg);
      }
    }
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-300">Đang tải khung giờ...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý Khung giờ Giao hàng</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          + Tạo Khung giờ mới
        </button>
      </div>

      <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên hiển thị</th>
              <th className="py-3 px-4 text-left">Ngày</th>
              <th className="py-3 px-4 text-left">Giờ</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {timeSlots.map((slot) => (
              <tr key={slot.id} className="hover:bg-gray-700">
                <td className="py-3 px-4 font-medium text-yellow-400">
                  {slot.displayText || 'Chưa đặt tên'}
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][slot.dayOfWeek] || '-'}
                </td>
                <td className="py-3 px-4 font-mono text-gray-400 text-sm">
                  {slot.startTime} - {slot.endTime}
                </td>
                <td className="py-3 px-4 text-center">
                  {slot.isActive ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-700 text-green-100 rounded-full">Kích hoạt</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-700 text-red-100 rounded-full">Ẩn</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleOpenEditModal(slot)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {timeSlots.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 px-4 text-center text-gray-400">
                  Chưa có khung giờ nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TimeSlotModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTimeSlot}
        timeSlotToEdit={timeSlotToEdit}
      />
    </div>
  );
}