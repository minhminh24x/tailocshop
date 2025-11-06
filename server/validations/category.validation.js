// server/validations/category.validation.js
import { z, ZodError } from 'zod';

export const createCategory = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Tên danh mục là bắt buộc' })
      .min(1, 'Tên danh mục không được để trống'),
    
    // 'description' đã được XÓA khỏi đây

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
    // Đúng như chỉ dẫn, chúng ta dùng UUID cho ID
    id: z.string().uuid('ID danh mục không hợp lệ (không phải UUID)'),
  }),
  body: z.object({
    // Dùng .partial() để tất cả các trường đều là optional
    name: z.string().min(3, 'Tên danh mục phải có ít nhất 3 ký tự').optional(),
    description: z.string().optional(),
  }).partial(), // .partial() làm cho tất cả các trường bên trong không bắt buộc
});

// Schema cho DELETE (xóa theo id)
const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID danh mục không hợp lệ (không phải UUID)'),
  }),
});

export const categoryValidation = {
  createCategorySchema,
  getCategoryBySlugSchema,
  updateCategorySchema,
  deleteCategorySchema,
};