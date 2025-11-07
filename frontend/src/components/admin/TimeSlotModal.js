// File: frontend/src/components/admin/TimeSlotModal.js
import React, { useState, useEffect } from 'react';

// Lấy từ schema.prisma
const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY", "ALL"];

const initialState = {
  startTime: '08:00',
  endTime: '12:00',
  dayOfWeek: 'ALL',
  isActive: true,
};

export default function TimeSlotModal({ isOpen, onClose, onSave, timeSlotToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (timeSlotToEdit) {
        setFormData({
          startTime: timeSlotToEdit.startTime,
          endTime: timeSlotToEdit.endTime,
          dayOfWeek: timeSlotToEdit.dayOfWeek,
          isActive: timeSlotToEdit.isActive,
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [isOpen, timeSlotToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Đảm bảo gửi đúng định dạng HH:mm
    const timeSlotData = {
      ...formData,
      startTime: formData.startTime.slice(0, 5), // "HH:mm"
      endTime: formData.endTime.slice(0, 5),     // "HH:mm"
    };
    
    await onSave(timeSlotData);
    setIsLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-gray-800 shadow-2xl border border-gray-700">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            {timeSlotToEdit ? 'Chỉnh sửa Khung giờ' : 'Tạo Khung giờ mới'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Giờ bắt đầu */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">Giờ bắt đầu</label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading} />
            </div>

            {/* Giờ kết thúc */}
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">Giờ kết thúc</label>
              <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading} />
            </div>
          </div>
          
          {/* Ngày trong tuần */}
          <div className="mt-4">
            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-300 mb-2">Ngày áp dụng</label>
            <select id="dayOfWeek" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isLoading} required>
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Kích hoạt */}
          <div className="mt-4">
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange}
                className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-pink-500 focus:ring-pink-500"
                disabled={isLoading} />
              <span>Kích hoạt (Hiển thị cho khách)</span>
            </label>
          </div>

          {/* Nút bấm */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition duration-200">
              Hủy
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition duration-200 disabled:bg-gray-500">
              {isLoading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}