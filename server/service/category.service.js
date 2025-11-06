// server/services/category.service.js
import prisma from '../lib/prisma.js'; // Đảm bảo có .js (nếu file của bạn là .js)
import slugify from 'slugify';
import ApiError from '../utils/ApiError.js'; // Giả sử file ApiError của bạn ở đây và có .js
import httpStatus from 'http-status';
import prisma from '../client/index.js';
import slugify from 'slugify';
/**
 * Lấy tất cả danh mục
 */
export const getAllCategories = async () => {
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
 * [ĐÃ SỬA LỖI] Xóa 'description'
 * @param {Object} categoryBody - Dữ liệu từ request body
 * @returns {Promise<Category>}
 */
export const createCategory = async (categoryBody) => {
  // [SỬA 1] Xóa 'description' khỏi đây
  const { name, parentId } = categoryBody;

  // 1. Tạo slug
  const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

  // 2. Kiểm tra slug đã tồn tại chưa
  const existingCategoryBySlug = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategoryBySlug) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug danh mục đã tồn tại');
  }

  // 3. Kiểm tra parentId (nếu người dùng cung cấp)
  if (parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: parentId },
    });
    if (!parentCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Danh mục cha không tồn tại');
    }
  }

  // 4. Chuẩn bị dữ liệu tạo mới
  const createData = {
    name,
    slug,
    // [SỬA 2] Xóa 'description' khỏi đây
    ...(parentId && { parent: { connect: { id: parentId } } }),
  };

  // 5. Tạo danh mục mới trong database (Dòng 55 của bạn)
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
  // findUnique hoạt động rất nhanh khi có @unique constraint
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
  const data = { ...updateBody };

  // 💡 Logic nghiệp vụ quan trọng:
  // Nếu người dùng cập nhật "name", chúng ta phải tự động
  // tạo lại "slug" và đảm bảo slug mới là duy nhất.
  if (updateBody.name) {
    const newSlug = slugify(updateBody.name, { lower: true, strict: true });

    // Kiểm tra xem slug mới đã tồn tại ở một danh mục KHÁC chưa
    const existingSlug = await prisma.category.findFirst({
      where: {
        slug: newSlug,
        NOT: {
          id: id, // Loại trừ chính danh mục đang cập nhật
        },
      },
    });

    if (existingSlug) {
      // Chúng ta có thể ném lỗi tùy chỉnh
      throw new Error('Tên danh mục mới đã bị trùng, vui lòng chọn tên khác.');
    }
    data.slug = newSlug; // Gán slug mới vào dữ liệu cập nhật
  }

  // update() của Prisma sẽ tự động ném lỗi nếu không tìm thấy id
  // (Lỗi P2025: Record to update not found)
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
  // ⭐️ Lưu ý quan trọng từ "Tài Lộc Shop":
  // Nếu schema.prisma của bạn có ràng buộc khóa ngoại (ví dụ:
  // Product có categoryId), thì Prisma sẽ KHÔNG cho phép xóa
  // danh mục này nếu nó đang được liên kết với bất kỳ sản phẩm nào.
  // Prisma sẽ ném lỗi P2003 (Foreign key constraint failed).
  // Đây là hành vi TỐT để bảo vệ toàn vẹn dữ liệu.
  // Middleware xử lý lỗi của bạn sẽ bắt lỗi này.

  return prisma.category.delete({
    where: { id },
  });
};

export const categoryService = {
  // ... (các hàm cũ)
  createCategory,
  getAllCategories,
  // Thêm các hàm mới
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};