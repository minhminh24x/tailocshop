// File: frontend/src/services/adminTimeSlotService.js
import apiClient from './apiClient.js';

const API_URL = '/delivery-time-slots';

// (ADMIN) Lấy tất cả khung giờ
export const getAllTimeSlotsAdmin = () => {
  return apiClient.get(API_URL); // Dùng route admin
};

// (ADMIN) Tạo khung giờ mới
export const createTimeSlotAdmin = (timeSlotData) => {
  // timeSlotData: { startTime: "HH:mm", endTime: "HH:mm", dayOfWeek: "MONDAY", isActive: true }
  return apiClient.post(API_URL, timeSlotData);
};

// (ADMIN) Cập nhật khung giờ
export const updateTimeSlotAdmin = (id, updateData) => {
  return apiClient.patch(`${API_URL}/${id}`, updateData);
};

// (ADMIN) Xóa khung giờ
export const deleteTimeSlotAdmin = (id) => {
  return apiClient.delete(`${API_URL}/${id}`);
};