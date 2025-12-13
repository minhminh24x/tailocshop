// File: backend/server/validations/vipLevel.validation.js
import { z } from 'zod';

// [FIX] Schema phù hợp với Prisma schema thực tế
// VipLevel có: level (Int @id), name, coinThreshold, discountPercent
const createVipLevel = z.object({
  body: z.object({
    level: z.number().int().min(0, 'Cấp độ phải là số nguyên >= 0'),
    name: z.string().min(1, 'Tên là bắt buộc'),
    coinThreshold: z.number().min(0, 'Ngưỡng xu tối thiểu phải >= 0'),
    discountPercent: z.number().min(0).max(100, 'Giảm giá từ 0-100').optional(),
  }),
});

// [FIX] Đổi từ id (uuid) sang level (int)
const getVipLevel = z.object({
  params: z.object({
    level: z.string().regex(/^\d+$/, 'Level phải là số nguyên'),
  }),
});

// [FIX] Đổi từ id sang level và minSpent sang coinThreshold
const updateVipLevel = z.object({
  params: z.object({
    level: z.string().regex(/^\d+$/, 'Level phải là số nguyên'),
  }),
  body: z.object({
    name: z.string().min(1, 'Tên là bắt buộc').optional(),
    coinThreshold: z.number().min(0, 'Ngưỡng xu tối thiểu phải >= 0').optional(),
    discountPercent: z.number().min(0).max(100, 'Giảm giá từ 0-100').optional(),
  }).partial().refine(data => Object.keys(data).length > 0, {
    message: 'Cần ít nhất một trường để cập nhật',
  }),
});

// [FIX] Đổi từ id sang level
const deleteVipLevel = z.object({
  params: z.object({
    level: z.string().regex(/^\d+$/, 'Level phải là số nguyên'),
  }),
});

export const vipLevelValidation = {
  createVipLevel,
  getVipLevel,
  updateVipLevel,
  deleteVipLevel,
};