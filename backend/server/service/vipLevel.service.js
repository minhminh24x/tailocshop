// File: backend/server/service/vipLevel.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Lấy tất cả cấp độ VIP (Admin & Public)
 * Sắp xếp theo minSpent
 */
const getAllVipLevels = async () => {
  return prisma.vipLevel.findMany({
    orderBy: {
      coinThreshold: 'asc',
    },
  });
};

/**
 * Lấy chi tiết 1 cấp độ VIP (Admin)
 */
const getVipLevelById = async (id) => {
  const vipLevel = await prisma.vipLevel.findUnique({
    where: { id },
  });
  if (!vipLevel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy cấp độ VIP');
  }
  return vipLevel;
};

/**
 * Tạo cấp độ VIP mới (Admin)
 */
const createVipLevel = async (vipLevelBody) => {
  // Đảm bảo minSpent là duy nhất
  const existing = await prisma.vipLevel.findFirst({
    where: { minSpent: vipLevelBody.minSpent }
  });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Đã tồn tại cấp độ VIP với mốc chi tiêu này.');
  }
  return prisma.vipLevel.create({
    data: vipLevelBody,
  });
};

/**
 * Cập nhật cấp độ VIP (Admin)
 */
const updateVipLevelById = async (id, updateBody) => {
  const vipLevel = await getVipLevelById(id);
  
  // Kiểm tra nếu minSpent thay đổi và bị trùng
  if (updateBody.minSpent && updateBody.minSpent !== vipLevel.minSpent) {
     const existing = await prisma.vipLevel.findFirst({
      where: { 
        minSpent: updateBody.minSpent,
        id: { not: id }
      }
    });
    if (existing) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Đã tồn tại cấp độ VIP khác với mốc chi tiêu này.');
    }
  }
  
  const updatedVipLevel = await prisma.vipLevel.update({
    where: { id },
    data: updateBody,
  });
  return updatedVipLevel;
};

/**
 * Xóa cấp độ VIP (Admin)
 */
const deleteVipLevelById = async (id) => {
  // Không cho xóa VIP 0 (Mặc định)
  const vipLevel = await getVipLevelById(id);
  if (vipLevel.minSpent === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Không thể xóa cấp độ VIP mặc định (VIP 0).');
  }

  // Kiểm tra xem có user nào đang ở cấp này không
  const usersInLevel = await prisma.user.count({
    where: { vipLevelId: id }
  });

  if (usersInLevel > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Không thể xóa, vẫn còn user ở cấp độ này. Hãy chuyển họ sang cấp khác trước.');
  }
  
  await prisma.vipLevel.delete({
    where: { id },
  });
  return { message: 'Xóa cấp độ VIP thành công' };
};

export const vipLevelService = {
  getAllVipLevels,
  getVipLevelById,
  createVipLevel,
  updateVipLevelById,
  deleteVipLevelById,
};