// File: backend/server/service/deliveryTimeSlot.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * [GIỮ NGUYÊN] Tạo khung giờ mới (Admin)
 */
const createDeliveryTimeSlot = async (timeSlotBody) => {
  return prisma.deliveryTimeSlot.create({
    data: timeSlotBody,
  });
};

/**
 * [SỬA] Lấy TẤT CẢ khung giờ (cho Admin)
 * Sẽ bao gồm cả các slot bị deactivate
 */
const getAllDeliveryTimeSlots = async () => {
  return prisma.deliveryTimeSlot.findMany({
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  });
};

/**
 * [ĐÃ FIX] Lấy các khung giờ CÔNG KHAI (cho Customer)
 * Chỉ lấy các slot `isActive: true`
 */
const getPublicDeliveryTimeSlots = async () => {
  return prisma.deliveryTimeSlot.findMany({
    where: {
      isActive: true,
      // Bỏ qua slot MẶC ĐỊNH (dùng khi không có slot nào)
      id: { not: "00000000-0000-0000-0000-000000000000" }
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  });
};

/**
 * [GIỮ NGUYÊN] Lấy chi tiết khung giờ (Admin)
 */
const getDeliveryTimeSlotById = async (id) => {
  const timeSlot = await prisma.deliveryTimeSlot.findUnique({
    where: { id },
  });
  if (!timeSlot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy khung giờ');
  }
  return timeSlot;
};

/**
 * [GIỮ NGUYÊN] Cập nhật khung giờ (Admin)
 */
const updateDeliveryTimeSlotById = async (id, updateBody) => {
  const timeSlot = await getDeliveryTimeSlotById(id); // Kiểm tra tồn tại
  const updatedTimeSlot = await prisma.deliveryTimeSlot.update({
    where: { id },
    data: updateBody,
  });
  return updatedTimeSlot;
};

/**
 * [GIỮ NGUYÊN] Xóa khung giờ (Admin)
 */
const deleteDeliveryTimeSlotById = async (id) => {
  await getDeliveryTimeSlotById(id); // Kiểm tra tồn tại

  // TODO: Kiểm tra xem có đơn hàng nào đang dùng slot này không

  await prisma.deliveryTimeSlot.delete({
    where: { id },
  });
  return { message: 'Xóa khung giờ thành công' };
};

export const deliveryTimeSlotService = {
  createDeliveryTimeSlot,
  getAllDeliveryTimeSlots, // Cho Admin
  getPublicDeliveryTimeSlots, // Cho Customer
  getDeliveryTimeSlotById,
  updateDeliveryTimeSlotById,
  deleteDeliveryTimeSlotById,
};
