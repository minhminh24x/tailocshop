// server/service/item.service.js
import prisma from '../lib/prisma.js';
import slugify from 'slugify';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Tạo vật phẩm mới
 * @param {Object} itemBody
 * @returns {Promise<Item>}
 */
const createItem = async (itemBody) => {
  const { categoryId, name, unit, ...otherData } = itemBody;

  // 1. Kiểm tra xem categoryId có tồn tại không
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Danh mục không tồn tại');
  }

  // 2. Tạo slug
  const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

  // 3. Kiểm tra ràng buộc unique(slug, unit)
  const existingItem = await prisma.item.findUnique({
    where: {
      slug_unit: {
        slug: slug,
        unit: unit,
      },
    },
  });

  if (existingItem) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Vật phẩm "${name}" với đơn vị "${unit}" đã tồn tại`
    );
  }

  // 4. Tạo item
  return prisma.item.create({
    data: {
      ...otherData,
      name,
      slug,
      unit,
      category: {
        connect: { id: categoryId },
      },
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
};

/**
 * Lấy tất cả vật phẩm (có thể thêm filter/pagination sau)
 * @returns {Promise<Item[]>}
 */
const getAllItems = async () => {
  return prisma.item.findMany({
    where: { isActive: true }, // Chỉ lấy các item đang được kích hoạt
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Lấy chi tiết vật phẩm bằng slug và unit
 * @param {string} slug
 * @param {ItemUnit} unit
 * @returns {Promise<Item | null>}
 */
const getItemBySlugAndUnit = async (slug, unit) => {
  return prisma.item.findUnique({
    where: {
      slug_unit: {
        slug,
        unit,
      },
    },
    include: {
      category: true, // Lấy tất cả thông tin của category
    },
  });
};

/**
 * Cập nhật vật phẩm bằng ID
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
const updateItem = async (id, updateBody) => {
  const { name, unit, ...data } = updateBody;

  const itemToUpdate = await prisma.item.findUnique({ where: { id } });
  if (!itemToUpdate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy vật phẩm');
  }

  let newSlug = itemToUpdate.slug;
  let newUnit = itemToUpdate.unit;

  // Nếu tên thay đổi, tạo slug mới
  if (name) {
    newSlug = slugify(name, { lower: true, strict: true, locale: 'vi' });
    data.name = name;
    data.slug = newSlug;
  }

  // Nếu unit thay đổi
  if (unit) {
    newUnit = unit;
    data.unit = unit;
  }

  // Nếu slug hoặc unit thay đổi, phải kiểm tra lại unique constraint
  if (name || unit) {
    const existingItem = await prisma.item.findUnique({
      where: {
        slug_unit: {
          slug: newSlug,
          unit: newUnit,
        },
        NOT: {
          id: id, // Loại trừ chính nó
        },
      },
    });

    if (existingItem) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Tên vật phẩm và đơn vị này đã tồn tại`
      );
    }
  }

  return prisma.item.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
};
/**
 * [HÀM MỚI] Lấy các vật phẩm nổi bật (top 4 tồn kho cao nhất)
 * @returns {Promise<Item[]>}
 */
const getFeaturedItems = async () => {
  return prisma.item.findMany({
    where: { isActive: true }, // Chỉ lấy các item đang được kích hoạt
    orderBy: {
      stockQuantity: 'desc', // Sắp xếp theo tồn kho GIẢM DẦN
    },
    take: 4, // Chỉ lấy 4 vật phẩm hàng đầu
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
};

/**
 * Xóa vật phẩm bằng ID
 * @param {string} id
 * @returns {Promise<Item>}
 */
const deleteItem = async (id) => {
  // Prisma sẽ ném lỗi P2003 nếu item này đã có trong 1 order_detail
  return prisma.item.delete({
    where: { id },
  });
};

export const itemService = {
  createItem,
  getAllItems,
  getFeaturedItems,
  getItemBySlugAndUnit,
  updateItem,
  deleteItem,
};