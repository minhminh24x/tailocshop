// File: backend/server/validations/vipLevel.validation.js
import { z } from 'zod';

const createVipLevel = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên là bắt buộc'),
    minSpent: z.number().min(0, 'Chi tiêu tối thiểu phải >= 0'),
    discountPercent: z.number().min(0).max(100, 'Giảm giá từ 0-100'),
    levelInt: z.number().int().min(0, 'Cấp độ phải là số nguyên >= 0').optional(),
  }),
});

const getVipLevel = z.object({
  params: z.object({
    id: z.string().uuid('ID không hợp lệ'),
  }),
});

const updateVipLevel = z.object({
  params: z.object({
    id: z.string().uuid('ID không hợp lệ'),
  }),
  body: z.object({
    name: z.string().min(1, 'Tên là bắt buộc').optional(),
    minSpent: z.number().min(0, 'Chi tiêu tối thiểu phải >= 0').optional(),
    discountPercent: z.number().min(0).max(100, 'Giảm giá từ 0-100').optional(),
    levelInt: z.number().int().min(0, 'Cấp độ phải là số nguyên >= 0').optional(),
  }).partial().refine(data => Object.keys(data).length > 0, {
    message: 'Cần ít nhất một trường để cập nhật',
  }),
});

const deleteVipLevel = z.object({
  params: z.object({
    id: z.string().uuid('ID không hợp lệ'),
  }),
});

export const vipLevelValidation = {
  createVipLevel,
  getVipLevel,
  updateVipLevel,
  deleteVipLevel,
};