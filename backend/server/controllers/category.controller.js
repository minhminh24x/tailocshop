// server/controllers/category.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { categoryService } from '../service/category.service.js'; // [ĐÃ SỬA] Chỉ dùng 1 import này
import ApiError from '../utils/ApiError.js'; // Import ApiError để dùng

/**
 * GET /api/categories
 */
// [ĐÃ SỬA] Xóa 'export'
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(httpStatus.OK).send(categories);
});

/**
 * POST /api/categories
 */
// [ĐÃ SỬA] Xóa 'export'
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

/**
 * GET /api/categories/:slug
 * Lấy chi tiết một danh mục bằng slug
 */
// [ĐÃ SỬA] Dùng asyncHandler
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await categoryService.getCategoryBySlug(slug);

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy danh mục');
  }

  res.status(200).json(category);
});

/**
 * PATCH /api/categories/:id
 * Cập nhật danh mục bằng ID
 */
// [ĐÃ SỬA] Dùng asyncHandler
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateBody = req.body;

  // Lưu ý: service 'updateCategory' của chúng ta đã xử lý lỗi
  // không tìm thấy (P2025) hoặc lỗi trùng slug (ApiError)
  const category = await categoryService.updateCategory(id, updateBody);
  res.status(200).json(category);
});

/**
 * DELETE /api/categories/:id
 * Xóa danh mục bằng ID
 */
// [ĐÃ SỬA] Dùng asyncHandler
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Service 'deleteCategory' sẽ ném lỗi nếu không tìm thấy (P2025)
  // hoặc lỗi ràng buộc khóa ngoại (P2003)
  await categoryService.deleteCategory(id);

  res.status(httpStatus.NO_CONTENT).send();
});

// [ĐÃ SỬA] Export một object duy nhất chứa TẤT CẢ các hàm
export const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};