// server/service/deliveryTimeSlot.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Tạo khung giờ mới
 * @param {Object} slotBody
 * @returns {Promise<DeliveryTimeSlot>}
 */
const createSlot = async (slotBody) => {
  return prisma.deliveryTimeSlot.create({
    data: slotBody,
  });
};

/**
 * Lấy tất cả khung giờ
 * @returns {Promise<DeliveryTimeSlot[]>}
 */
const getAllSlots = async () => {
  return prisma.deliveryTimeSlot.findMany({
    orderBy: {
      displayText: 'asc', // Sắp xếp theo A-Z
    },
  });
};

/**
 * Lấy tất cả khung giờ ĐANG KÍCH HOẠT (cho khách hàng chọn)
 * @returns {Promise<DeliveryTimeSlot[]>}
 */
const getActiveSlots = async () => {
  return prisma.deliveryTimeSlot.findMany({
    where: { isActive: true },
    orderBy: {
      displayText: 'asc',
    },
  });
};

/**
 * Cập nhật khung giờ (Admin)
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<DeliveryTimeSlot>}
 */
const updateSlot = async (id, updateBody) => {
  // Lỗi P2025 (Không tìm thấy) sẽ được middleware lỗi chung xử lý
  return prisma.deliveryTimeSlot.update({
    where: { id },
    data: updateBody,
  });
};

/**
 * Xóa khung giờ (Admin)
 * @param {string} id
 * @returns {Promise<DeliveryTimeSlot>}
 */
const deleteSlot = async (id) => {
  // ⭐️ Lưu ý: Nếu một Order đang dùng slot này, Prisma sẽ ném lỗi P2003
  // (Foreign key constraint failed) và middleware lỗi sẽ bắt
  // Đây là hành vi TỐT.
  return prisma.deliveryTimeSlot.delete({
    where: { id },
  });
};

export const deliveryTimeSlotService = {
  createSlot,
  getAllSlots,
  getActiveSlots,
  updateSlot,
  deleteSlot,
};