// server/service/item.service.js
import prisma from '../lib/prisma.js';
import slugify from 'slugify';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { calculateAllUnitPrices, UNIT_MULTIPLIER } from '../utils/unitConstants.js';

/**
 * [NÂNG CẤP] Tạo vật phẩm mới với hỗ trợ multi-unit
 * @param {Object} itemBody
 * @returns {Promise<Item>}
 */
const createItem = async (itemBody) => {
  const {
    categoryId,
    name,
    allowedUnits = ['PIECE'],
    baseUnit = 'PIECE',
    basePriceCoin,
    basePriceUsd,
    // [DEPRECATED] Giữ lại để tương thích
    priceCoin,
    priceUsd,
    ...otherData
  } = itemBody;

  // 1. Kiểm tra xem categoryId có tồn tại không
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Danh mục không tồn tại');
  }

  // 2. Tạo slug
  const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

  // 3. Kiểm tra ràng buộc unique(slug) - không còn unique với unit nữa
  const existingItem = await prisma.item.findUnique({
    where: { slug },
  });

  if (existingItem) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Vật phẩm "${name}" đã tồn tại`
    );
  }

  // 4. Validate allowedUnits
  const validUnits = ['PIECE', 'STACK', 'SHULKER'];
  for (const unit of allowedUnits) {
    if (!validUnits.includes(unit)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Đơn vị "${unit}" không hợp lệ`);
    }
  }

  // 5. Validate baseUnit phải nằm trong allowedUnits
  if (!allowedUnits.includes(baseUnit)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `baseUnit "${baseUnit}" phải nằm trong allowedUnits`
    );
  }

  // 6. Tạo item với multi-unit data
  const createdItem = await prisma.item.create({
    data: {
      ...otherData,
      name,
      slug,
      allowedUnits,
      baseUnit,
      basePriceCoin: basePriceCoin || priceCoin || null,
      basePriceUsd: basePriceUsd || priceUsd || null,
      // [DEPRECATED] Giữ lại để tương thích ngược
      priceCoin: basePriceCoin || priceCoin || null,
      priceUsd: basePriceUsd || priceUsd || null,
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

  // 7. Thêm pricesPerUnit vào response
  return {
    ...createdItem,
    pricesPerUnit: calculateAllUnitPrices(createdItem)
  };
};

/**
 * [MỚI] Lấy TẤT CẢ vật phẩm cho Admin (bao gồm cả item bị ẩn)
 * @returns {Promise<Item[]>}
 */
const getAllItemsAdmin = async () => {
  return prisma.item.findMany({
    // KHÔNG CÓ "where: { isActive: true }"
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
 * [NÂNG CẤP] Lấy vật phẩm với pagination và filter
 * @param {object} query - { page, limit, categoryId, search }
 * @returns {Promise<{data: Item[], pagination: object}>}
 */
const getAllItems = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    categoryId,
    search,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where = { isActive: true };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  // Get total count for pagination
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * [SỬA] Lấy chi tiết vật phẩm bằng slug (không cần unit nữa vì slug là unique)
 * @param {string} slug
 * @returns {Promise<Item | null>}
 */
const getItemBySlug = async (slug) => {
  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!item) return null;

  // Thêm pricesPerUnit vào response
  return {
    ...item,
    pricesPerUnit: calculateAllUnitPrices(item)
  };
};

/**
 * [SỬA] Cập nhật vật phẩm bằng ID với hỗ trợ multi-unit
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
const updateItem = async (id, updateBody) => {
  const {
    name,
    allowedUnits,
    baseUnit,
    basePriceCoin,
    basePriceUsd,
    // [DEPRECATED] Giữ lại để tương thích
    priceCoin,
    priceUsd,
    ...data
  } = updateBody;

  const itemToUpdate = await prisma.item.findUnique({ where: { id } });
  if (!itemToUpdate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy vật phẩm');
  }

  let newSlug = itemToUpdate.slug;

  // Nếu tên thay đổi, tạo slug mới
  if (name) {
    newSlug = slugify(name, { lower: true, strict: true, locale: 'vi' });

    // Kiểm tra slug mới có bị trùng không (loại trừ chính nó)
    const existingItem = await prisma.item.findFirst({
      where: {
        slug: newSlug,
        NOT: { id: id }
      },
    });

    if (existingItem) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Vật phẩm với tên này đã tồn tại`
      );
    }

    data.name = name;
    data.slug = newSlug;
  }

  // Xử lý multi-unit fields
  if (allowedUnits) {
    const validUnits = ['PIECE', 'STACK', 'SHULKER'];
    for (const unit of allowedUnits) {
      if (!validUnits.includes(unit)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Đơn vị "${unit}" không hợp lệ`);
      }
    }
    data.allowedUnits = allowedUnits;
  }

  if (baseUnit) {
    const finalAllowedUnits = allowedUnits || itemToUpdate.allowedUnits;
    if (!finalAllowedUnits.includes(baseUnit)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `baseUnit "${baseUnit}" phải nằm trong allowedUnits`
      );
    }
    data.baseUnit = baseUnit;
  }

  // Xử lý giá - ưu tiên basePriceCoin/Usd, fallback về priceCoin/Usd
  if (basePriceCoin !== undefined) {
    data.basePriceCoin = basePriceCoin;
    data.priceCoin = basePriceCoin; // Sync deprecated field
  } else if (priceCoin !== undefined) {
    data.basePriceCoin = priceCoin;
    data.priceCoin = priceCoin;
  }

  if (basePriceUsd !== undefined) {
    data.basePriceUsd = basePriceUsd;
    data.priceUsd = basePriceUsd; // Sync deprecated field
  } else if (priceUsd !== undefined) {
    data.basePriceUsd = priceUsd;
    data.priceUsd = priceUsd;
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return {
    ...updatedItem,
    pricesPerUnit: calculateAllUnitPrices(updatedItem)
  };
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
  getAllItemsAdmin,
  getFeaturedItems,
  getItemBySlug, // [SỬA] Đổi từ getItemBySlugAndUnit
  updateItem,
  deleteItem,
};