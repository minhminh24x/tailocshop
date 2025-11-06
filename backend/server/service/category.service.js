// server/service/category.service.js
import prisma from '../lib/prisma.js'; // [ĐÃ SỬA] Giữ lại 1 import
import slugify from 'slugify'; // [ĐÃ SỬA] Giữ lại 1 import
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
// [ĐÃ XÓA] Bỏ các import trùng lặp

/**
 * Lấy tất cả danh mục
 */
// [ĐÃ SỬA] Xóa 'export'
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
  return categories;
};

/**
 * Tạo danh mục mới
 * @param {Object} categoryBody - Dữ liệu từ request body
 * @returns {Promise<Category>}
 */
// [ĐÃ SỬA] Xóa 'export'
const createCategory = async (categoryBody) => {
  const { name, parentId } = categoryBody;
  const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

  const existingCategoryBySlug = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategoryBySlug) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug danh mục đã tồn tại');
  }

  if (parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: parentId },
    });
    if (!parentCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Danh mục cha không tồn tại');
    }
  }

  const createData = {
    name,
    slug,
    ...(parentId && { parent: { connect: { id: parentId } } }),
  };

  const category = await prisma.category.create({
    data: createData,
  });

  return category;
};

/**
 * Lấy chi tiết danh mục bằng slug
 * @param {string} slug
 * @returns {Promise<Category | null>}
 */
const getCategoryBySlug = async (slug) => {
  return prisma.category.findUnique({
    where: { slug },
  });
};

/**
 * Cập nhật danh mục bằng ID
 * @param {string} id - UUID của danh mục
 * @param {object} updateBody - Dữ liệu cần cập nhật
 * @returns {Promise<Category>}
 */
const updateCategory = async (id, updateBody) => {
  // [ĐÃ SỬA] Tự động xóa 'description' nếu có ai đó gửi lên
  const { description, ...data } = updateBody;

  if (data.name) {
    const newSlug = slugify(data.name, { lower: true, strict: true });

    const existingSlug = await prisma.category.findFirst({
      where: {
        slug: newSlug,
        NOT: {
          id: id,
        },
      },
    });

    if (existingSlug) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Tên danh mục mới đã bị trùng.');
    }
    data.slug = newSlug;
  }
  
  // [ĐÃ SỬA] Kiểm tra parentId nếu có cập nhật
  if (data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: data.parentId },
    });
    if (!parentCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Danh mục cha không tồn tại');
    }
    // Cập nhật quan hệ
    data.parent = { connect: { id: data.parentId } };
  } else if (data.parentId === null) {
    // Cho phép gỡ bỏ danh mục cha
    data.parent = { disconnect: true };
  }
  // Xóa parentId khỏi data gốc để tránh lỗi
  delete data.parentId;


  return prisma.category.update({
    where: { id },
    data: data,
  });
};

/**
 * Xóa danh mục bằng ID
 * @param {string} id - UUID của danh mục
 * @returns {Promise<Category>}
 */
const deleteCategory = async (id) => {
  // Logic của bạn đã tốt, Prisma sẽ tự ném lỗi P2003
  // nếu có sản phẩm con trỏ tới.
  return prisma.category.delete({
    where: { id },
  });
};

// [ĐÃ SỬA] Export một object duy nhất chứa TẤT CẢ các hàm
export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};