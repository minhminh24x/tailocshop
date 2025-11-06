// server/validations/category.validation.js
import { z } from 'zod';

// Đổi tên và bỏ 'export'
const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Tên danh mục là bắt buộc' })
      .min(1, 'Tên danh mục không được để trống'),

    parentId: z.string().uuid('parentId không hợp lệ').optional().nullable(),
  }),
});

// Schema cho GET (lấy theo slug)
const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug là bắt buộc'),
  }),
});

// Schema cho UPDATE (cập nhật theo id)
const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID danh mục không hợp lệ (không phải UUID)'),
  }),
  body: z.object({
    name: z.string().min(3, 'Tên danh mục phải có ít nhất 3 ký tự').optional(),
    // [ĐÃ XÓA] Xóa trường 'description' vì không có trong schema.prisma
    // description: z.string().optional(),
    parentId: z.string().uuid('parentId không hợp lệ').optional().nullable(),
  }).partial(), // .partial() làm cho tất cả các trường bên trong không bắt buộc
});

// Schema cho DELETE (xóa theo id)
const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID danh mục không hợp lệ (không phải UUID)'),
  }),
});

// [ĐÃ SỬA] Thêm 'createCategorySchema' vào object export
export const categoryValidation = {
  createCategorySchema, // Thêm vào đây
  getCategoryBySlugSchema,
  updateCategorySchema,
  deleteCategorySchema,
};