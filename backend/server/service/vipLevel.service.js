// File: backend/server/service/vipLevel.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Lấy tất cả cấp độ VIP (Admin & Public)
 * Sắp xếp theo coinThreshold
 */
const getAllVipLevels = async () => {
  return prisma.vipLevel.findMany({
    orderBy: {
      coinThreshold: 'asc',
    },
  });
};

/**
 * [FIX] Lấy chi tiết 1 cấp độ VIP (Admin)
 * Sử dụng 'level' làm key vì đó là @id trong schema
 */
const getVipLevelByLevel = async (level) => {
  const levelInt = parseInt(level, 10);
  if (isNaN(levelInt)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Level phải là số nguyên');
  }

  const vipLevel = await prisma.vipLevel.findUnique({
    where: { level: levelInt },
  });
  if (!vipLevel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy cấp độ VIP');
  }
  return vipLevel;
};

/**
 * [FIX] Tạo cấp độ VIP mới (Admin)
 * Kiểm tra trùng coinThreshold thay vì minSpent
 */
const createVipLevel = async (vipLevelBody) => {
  const { level, name, coinThreshold, discountPercent } = vipLevelBody;

  // Kiểm tra level đã tồn tại chưa (vì level là @id)
  const existingLevel = await prisma.vipLevel.findUnique({
    where: { level: level }
  });
  if (existingLevel) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Đã tồn tại cấp độ VIP level ${level}.`);
  }

  // Kiểm tra coinThreshold có bị trùng không
  const existingThreshold = await prisma.vipLevel.findFirst({
    where: { coinThreshold: coinThreshold }
  });
  if (existingThreshold) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Đã tồn tại cấp độ VIP với mốc chi tiêu này.');
  }

  return prisma.vipLevel.create({
    data: {
      level,
      name,
      coinThreshold,
      discountPercent: discountPercent || 0,
    },
  });
};

/**
 * [FIX] Cập nhật cấp độ VIP (Admin)
 * Sử dụng coinThreshold thay vì minSpent
 */
const updateVipLevelByLevel = async (level, updateBody) => {
  const vipLevel = await getVipLevelByLevel(level);

  // Nếu coinThreshold thay đổi, kiểm tra trùng
  if (updateBody.coinThreshold !== undefined &&
    parseFloat(updateBody.coinThreshold) !== parseFloat(vipLevel.coinThreshold)) {
    const existing = await prisma.vipLevel.findFirst({
      where: {
        coinThreshold: updateBody.coinThreshold,
        level: { not: vipLevel.level }
      }
    });
    if (existing) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Đã tồn tại cấp độ VIP khác với mốc chi tiêu này.');
    }
  }

  const updatedVipLevel = await prisma.vipLevel.update({
    where: { level: vipLevel.level },
    data: updateBody,
  });
  return updatedVipLevel;
};

/**
 * [FIX] Xóa cấp độ VIP (Admin)
 * Kiểm tra coinThreshold === 0 thay vì minSpent
 * Sử dụng vipLevelInt thay vì vipLevelId
 */
const deleteVipLevelByLevel = async (level) => {
  const vipLevel = await getVipLevelByLevel(level);

  // Không cho xóa VIP 0 (Mặc định)
  if (vipLevel.level === 0 || parseFloat(vipLevel.coinThreshold) === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Không thể xóa cấp độ VIP mặc định (VIP 0).');
  }

  // [FIX] Kiểm tra xem có user nào đang ở cấp này không
  // Schema User dùng vipLevelInt, không phải vipLevelId
  const usersInLevel = await prisma.user.count({
    where: { vipLevelInt: vipLevel.level }
  });

  if (usersInLevel > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Không thể xóa, vẫn còn user ở cấp độ này. Hãy chuyển họ sang cấp khác trước.');
  }

  await prisma.vipLevel.delete({
    where: { level: vipLevel.level },
  });
  return { message: 'Xóa cấp độ VIP thành công' };
};

export const vipLevelService = {
  getAllVipLevels,
  getVipLevelByLevel,
  createVipLevel,
  updateVipLevelByLevel,
  deleteVipLevelByLevel,
};