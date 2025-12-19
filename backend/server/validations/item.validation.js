// server/validations/item.validation.js
// [NÂNG CẤP] Hỗ trợ Multi-Unit System
import { z } from 'zod';
import pkg from '@prisma/client';
const { ItemUnit } = pkg;

const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Tên vật phẩm phải có ít nhất 3 ký tự'),
    description: z.string().optional().nullable(),
    thumbnailImageUrl: z.string().optional().nullable(),
    categoryId: z.string().uuid('ID danh mục không hợp lệ'),

    // [MỚI] Multi-Unit System
    allowedUnits: z.array(z.nativeEnum(ItemUnit)).min(1, 'Phải có ít nhất 1 đơn vị').default(['PIECE']),
    baseUnit: z.nativeEnum(ItemUnit, {
      errorMap: () => ({ message: 'Đơn vị cơ sở không hợp lệ (PIECE, STACK, SHULKER)' }),
    }).default('PIECE'),

    // [ĐÃ ĐỔI TÊN] basePriceCoin/Usd thay vì priceCoin/Usd
    basePriceCoin: z.number().positive('Giá Xu phải lớn hơn 0').optional().nullable(),
    basePriceUsd: z.number().positive('Giá USD phải lớn hơn 0').optional().nullable(),

    // Legacy fields (backward compatibility)
    priceCoin: z.number().positive('Giá Coin phải lớn hơn 0').optional().nullable(),
    priceUsd: z.number().positive('Giá USD phải lớn hơn 0').optional().nullable(),
    unit: z.nativeEnum(ItemUnit).optional(), // Legacy support

    stockQuantity: z.number().int().min(0, 'Số lượng tồn kho không thể âm').default(0),
    isActive: z.boolean().default(true),
  }),
});

const updateItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID vật phẩm không hợp lệ'),
  }),
  body: createItemSchema.shape.body.partial(),
});

// GET sẽ dùng slug (unit là optional vì có route fallback)
const getItemSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug là bắt buộc'),
    unit: z.nativeEnum(ItemUnit).optional(),
  }),
});

const deleteItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID vật phẩm không hợp lệ'),
  }),
});

export const itemValidation = {
  createItemSchema,
  updateItemSchema,
  getItemSchema,
  deleteItemSchema,
};