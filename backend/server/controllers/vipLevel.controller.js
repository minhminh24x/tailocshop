// File: backend/server/controllers/vipLevel.controller.js
import httpStatus from 'http-status';
import { vipLevelService } from '../service/vipLevel.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public & Admin: Lấy tất cả
const getAllVipLevels = asyncHandler(async (req, res) => {
  const vipLevels = await vipLevelService.getAllVipLevels();
  res.status(httpStatus.OK).send(vipLevels);
});

// [FIX] Admin: Lấy chi tiết - đổi từ id sang level
const getVipLevelByLevel = asyncHandler(async (req, res) => {
  const vipLevel = await vipLevelService.getVipLevelByLevel(req.params.level);
  res.status(httpStatus.OK).send(vipLevel);
});

// Admin: Tạo mới
const createVipLevel = asyncHandler(async (req, res) => {
  const vipLevel = await vipLevelService.createVipLevel(req.body);
  res.status(httpStatus.CREATED).send(vipLevel);
});

// [FIX] Admin: Cập nhật - đổi từ id sang level
const updateVipLevelByLevel = asyncHandler(async (req, res) => {
  const vipLevel = await vipLevelService.updateVipLevelByLevel(req.params.level, req.body);
  res.status(httpStatus.OK).send(vipLevel);
});

// [FIX] Admin: Xóa - đổi từ id sang level
const deleteVipLevelByLevel = asyncHandler(async (req, res) => {
  await vipLevelService.deleteVipLevelByLevel(req.params.level);
  res.status(httpStatus.OK).send({ message: 'Xóa cấp độ VIP thành công' });
});

export const vipLevelController = {
  getAllVipLevels,
  getVipLevelByLevel,
  createVipLevel,
  updateVipLevelByLevel,
  deleteVipLevelByLevel,
};