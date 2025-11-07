// server/controllers/deliveryTimeSlot.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { deliveryTimeSlotService } from '../service/deliveryTimeSlot.service.js';

// === Dành cho Admin ===

const createSlot = asyncHandler(async (req, res) => {
  const slot = await deliveryTimeSlotService.createSlot(req.body);
  res.status(httpStatus.CREATED).send(slot);
});

const updateSlot = asyncHandler(async (req, res) => {
  const slot = await deliveryTimeSlotService.updateSlot(req.params.id, req.body);
  res.status(httpStatus.OK).send(slot);
});

const deleteSlot = asyncHandler(async (req, res) => {
  await deliveryTimeSlotService.deleteSlot(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

// Admin: Lấy tất cả
const getAllDeliveryTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await deliveryTimeSlotService.getAllDeliveryTimeSlots();
  res.status(httpStatus.OK).send(timeSlots);
});

// === HÀM MỚI ===
// Public: Lấy các slot active
const getPublicDeliveryTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await deliveryTimeSlotService.getPublicDeliveryTimeSlots();
  res.status(httpStatus.OK).send(timeSlots);
});
// === KẾT THÚC HÀM MỚI ===

const getAllSlots = asyncHandler(async (req, res) => {
  const slots = await deliveryTimeSlotService.getAllSlots();
  res.status(httpStatus.OK).send(slots);
});

// === Dành cho Khách hàng (Public) ===

const getActiveSlots = asyncHandler(async (req, res) => {
  const slots = await deliveryTimeSlotService.getActiveSlots();
  res.status(httpStatus.OK).send(slots);
});

export const deliveryTimeSlotController = {
  createSlot,
  updateSlot,
  getPublicDeliveryTimeSlots,
  deleteSlot,
  getAllSlots,
  getActiveSlots,
};