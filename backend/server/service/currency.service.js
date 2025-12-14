// File: backend/server/service/currency.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Lấy tỷ giá hối đoái bằng rateType (Public)
 * @param {string} rateType - Tên của tỷ giá (ví dụ: 'XU_TO_USD')
 * @returns {Promise<Decimal>}
 */
const getExchangeRate = async (rateType) => {
  const currencyRate = await prisma.currencyExchangeRate.findUnique({
    where: { rateType: rateType },
  });

  if (!currencyRate) {
    throw new ApiError(httpStatus.NOT_FOUND, `Không tìm thấy tỷ giá cho: ${rateType}`);
  }
  return currencyRate.rate;
};

/**
 * [MỚI] Lấy TẤT CẢ tỷ giá (Cho Admin)
 * @returns {Promise<CurrencyExchangeRate[]>}
 */
const getAllExchangeRates = async () => {
  return prisma.currencyExchangeRate.findMany({
    orderBy: { rateType: 'asc' },
    include: {
      updatedBy: {
        select: {
          id: true,
          inGameName: true, // [SỬA] Đổi từ 'username' thành 'inGameName'
        },
      },
    },
  });
};

/**
 * [MỚI] Cập nhật tỷ giá (Cho Admin)
 * @param {string} rateType - Tên tỷ giá cần cập nhật
 * @param {number} newRate - Giá trị mới
 * @param {string} adminId - ID của Admin thực hiện
 * @returns {Promise<CurrencyExchangeRate>}
 */
const updateExchangeRate = async (rateType, newRate, adminId) => {
  try {
    const updatedRate = await prisma.currencyExchangeRate.update({
      where: { rateType: rateType },
      data: {
        rate: newRate,
        updatedById: adminId, // Cập nhật người sửa
      },
      include: {
        updatedBy: {
          select: { id: true, inGameName: true }, // [SỬA] username -> inGameName
        },
      },
    });
    return updatedRate;
  } catch (error) {
    // P2025: Record to update not found
    if (error.code === 'P2025') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy tỷ giá để cập nhật');
    }
    throw error;
  }
};

export const currencyService = {
  getExchangeRate,
  getAllExchangeRates, // Thêm
  updateExchangeRate,  // Thêm
};