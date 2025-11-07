// File: backend/server/controllers/vipLevel.controller.js
import httpStatus from 'http-status';
import { vipLevelService } from '../service/vipLevel.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public & Admin: Lấy tất cả
const getAllVipLevels = asyncHandler(async (req, res) => {
  const vipLevels = await vipLevelService.getAllVipLevels();
  res.status(httpStatus.OK).send(vipLevels);
});

// Admin: Lấy chi tiết
const getVipLevelById = asyncHandler(async (req, res) => {
  const vipLevel = await vipLevelService.getVipLevelById(req.params.id);
  res.status(httpStatus.OK).send(vipLevel);
});

// Admin: Tạo mới
const createVipLevel = asyncHandler(async (req, res) => {
  const vipLevel = await vipLevelService.createVipLevel(req.body);
  res.status(httpStatus.CREATED).send(vipLevel);
});

// Admin: Cập nhật
const updateVipLevelById = asyncHandler(async (req, res) => {
  const vipLevel = await vipLevelService.updateVipLevelById(req.params.id, req.body);
  res.status(httpStatus.OK).send(vipLevel);
});

// Admin: Xóa
const deleteVipLevelById = asyncHandler(async (req, res) => {
  await vipLevelService.deleteVipLevelById(req.params.id);
  res.status(httpStatus.OK).send({ message: 'Xóa cấp độ VIP thành công' });
});

export const vipLevelController = {
  getAllVipLevels,
  getVipLevelById,
  createVipLevel,
  updateVipLevelById,
  deleteVipLevelById,
};