// File: backend/server/controllers/currency.controller.js
import httpStatus from 'http-status';
import { currencyService } from '../service/currency.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// (Hàm getRate (public) giữ nguyên)
const getRate = asyncHandler(async (req, res) => {
  const { rateType } = req.params;
  const rate = await currencyService.getExchangeRate(rateType);
  res.status(httpStatus.OK).send({ rateType, rate });
});

/**
 * [MỚI] Lấy tất cả tỷ giá (Admin)
 */
const getAllRates = asyncHandler(async (req, res) => {
  const rates = await currencyService.getAllExchangeRates();
  res.status(httpStatus.OK).send(rates);
});

/**
 * [MỚI] Cập nhật 1 tỷ giá (Admin)
 */
const updateRate = asyncHandler(async (req, res) => {
  const { rateType } = req.params;
  const { rate } = req.body; // Giá trị mới từ body
  const adminId = req.user.id; // Lấy từ authMiddleware

  const updatedRate = await currencyService.updateExchangeRate(rateType, rate, adminId);
  res.status(httpStatus.OK).send(updatedRate);
});

export const currencyController = {
  getRate,
  getAllRates, // Thêm
  updateRate,  // Thêm
};