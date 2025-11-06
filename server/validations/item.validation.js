// server/validations/item.validation.js
import { z } from 'zod';
import { ItemUnit } from '@prisma/client'; // Import ENUM từ Prisma

const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Tên vật phẩm phải có ít nhất 3 ký tự'),
    description: z.string().optional(),
    categoryId: z.string().uuid('ID danh mục không hợp lệ'),
    unit: z.nativeEnum(ItemUnit, {
      errorMap: () => ({ message: 'Đơn vị không hợp lệ (PIECE, STACK, SHULKER)' }),
    }),
    priceUsd: z
      .number()
      .positive('Giá USD phải lớn hơn 0')
      .optional()
      .nullable(),
    priceCoin: z
      .number()
      .positive('Giá Coin phải lớn hơn 0')
      .optional()
      .nullable(),
    stockQuantity: z
      .number()
      .int()
      .min(0, 'Số lượng tồn kho không thể âm')
      .default(0),
    isActive: z.boolean().default(true),
  }),
});

const updateItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID vật phẩm không hợp lệ'),
  }),
  body: createItemSchema.body.partial(), // Tất cả các trường đều là optional
});

// GET sẽ dùng slug và unit, vì nó là unique
const getItemSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug là bắt buộc'),
    unit: z.nativeEnum(ItemUnit, {
      errorMap: () => ({ message: 'Đơn vị không hợp lệ' }),
    }),
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