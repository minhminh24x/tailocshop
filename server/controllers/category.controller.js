// server/controllers/category.controller.js
import httpStatus from 'http-status';
// Import tất cả các hàm đã export từ service
import * as categoryService from '../service/category.service.js';
// Giả sử bạn có file asyncHandler tại utils
import asyncHandler from '../utils/asyncHandler.js'; 
import { categoryService } from '../../services/index.js';
/**
 * GET /api/categories
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(httpStatus.OK).send(categories);
});

/**
 * POST /api/categories
 */
export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);

    // Xử lý trường hợp không tìm thấy
    if (!category) {
      // Chúng ta có thể dùng một lớp Error tùy chỉnh (ví dụ ApiError)
      // ở đây, nhưng tạm thời dùng res.status() để đơn giản
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error); // Chuyển lỗi cho middleware xử lý lỗi chung
  }
};

/**
 * Cập nhật danh mục bằng ID
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateBody = req.body;

    const category = await categoryService.updateCategory(id, updateBody);
    res.status(200).json(category);
  } catch (error) {
    // Lỗi có thể xảy ra:
    // 1. Không tìm thấy (Prisma ném lỗi P2025)
    // 2. Slug mới (từ tên mới) bị trùng
    next(error);
  }
};

/**
 * Xóa danh mục bằng ID
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);

    // Tiêu chuẩn RESTful: 204 No Content cho DELETE thành công
    res.status(204).send();
  } catch (error) {
    // Lỗi có thể xảy ra:
    // 1. Không tìm thấy (Prisma ném lỗi P2025)
    // 2. Lỗi ràng buộc khóa ngoại (ví dụ: danh mục đang được
    //    sử dụng bởi nhiều sản phẩm)
    next(error);
  }
};

export const categoryController = {
  // ... (các hàm cũ)
  createCategory,
  getAllCategories,
  // Thêm các hàm mới
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};