// server/controllers/deliveryTimeSlot.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { deliveryTimeSlotService } from '../service/deliveryTimeSlot.service.js';

// === Dành cho Admin ===

// Tạo khung giờ
const createSlot = asyncHandler(async (req, res) => {
  const slot = await deliveryTimeSlotService.createDeliveryTimeSlot(req.body);
  res.status(httpStatus.CREATED).send(slot);
});

// Cập nhật khung giờ
const updateSlot = asyncHandler(async (req, res) => {
  const slot = await deliveryTimeSlotService.updateDeliveryTimeSlotById(req.params.id, req.body);
  res.status(httpStatus.OK).send(slot);
});

// Xóa khung giờ
const deleteSlot = asyncHandler(async (req, res) => {
  await deliveryTimeSlotService.deleteDeliveryTimeSlotById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

// Admin: Lấy tất cả khung giờ
const getAllDeliveryTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await deliveryTimeSlotService.getAllDeliveryTimeSlots();
  res.status(httpStatus.OK).send(timeSlots);
});

// === Dành cho khách hàng (Public) ===
const getPublicDeliveryTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await deliveryTimeSlotService.getPublicDeliveryTimeSlots();
  res.status(httpStatus.OK).send(timeSlots);
});

// Export các hàm
export const deliveryTimeSlotController = {
  createSlot,
  updateSlot,
  deleteSlot,
  getAllDeliveryTimeSlots,
  getPublicDeliveryTimeSlots,
};
