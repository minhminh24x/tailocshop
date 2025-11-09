// File: backend/server/service/order.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

// === HÀM HELPER (ĐÃ SỬA LỖI TỪ ĐẦU) ===
/**
 * Cập nhật cấp độ VIP cho user dựa trên tổng chi tiêu
 * @param {object} tx - Prisma transaction client
 * @param {string} userId - ID của user
 * @param {number} newTotalSpent - Tổng chi tiêu MỚI (đã quy đổi)
 */
const updateUserVipLevel = async (tx, userId, newTotalSpent) => {
  // 1. Lấy tất cả các cấp VIP, sắp xếp GIẢM DẦN theo ngưỡng coin
  const allVipLevels = await tx.vipLevel.findMany({
    orderBy: { coinThreshold: 'desc' },
  });

  // 2. Tìm cấp VIP cao nhất mà user đạt được
  let newVipLevelInt = 0; // Mặc định là 0 (Level 0)
  for (const level of allVipLevels) {
    if (newTotalSpent >= level.coinThreshold) {
      newVipLevelInt = level.level; // Lấy level (là @id)
      break; 
    }
  }

  // 3. Cập nhật cho user
  await tx.user.update({
    where: { id: userId },
    data: { vipLevelInt: newVipLevelInt },
  });
};
// === KẾT THÚC HÀM HELPER ===


/**
 * [NÂNG CẤP CUỐI] Tạo đơn hàng mới (Hỗ trợ Mixed-Currency VÀ Quy đổi VIP)
 * @param {string} userId - ID của user từ req.user
 * @param {object} orderData - Dữ liệu từ req.body
 * @returns {Promise<object>} Đơn hàng vừa tạo
 */
const createOrder = async (userId, orderData) => {
  // [SỬA] preferredCurrency là 'COIN' hoặc 'USD'
  const { items, inGameName, deliveryTimeSlotId, preferredCurrency } = orderData;

  // 1. Kiểm tra dữ liệu đầu vào cơ bản
  if (!items || items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Giỏ hàng không được rỗng');
  }
  if (!inGameName || inGameName.trim() === '') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng nhập tên trong game');
  }
  if (!deliveryTimeSlotId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng chọn khung giờ giao hàng');
  }
  if (!preferredCurrency || !['COIN', 'USD'].includes(preferredCurrency)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng chọn loại tiền tệ ưu tiên (COIN hoặc USD)');
  }

  // 2. Bắt đầu một GIAO DỊCH (TRANSACTION)
  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      // 2.1. Lấy thông tin User (để tính VIP)
      const user = await tx.user.findFirstOrThrow({
        where: { id: userId },
        include: { vipLevel: true },
      });

      const itemIds = items.map((item) => item.itemId);
      const dbItems = await tx.item.findMany({
        where: { id: { in: itemIds } },
      });

      // [MỚI] 2.1b. Lấy tỷ giá hối đoái (Theo yêu cầu: XU_TO_USD)
      const xuToUsdRateEntry = await tx.currencyExchangeRate.findUnique({
        where: { rateType: 'XU_TO_USD' }, // [SỬA] Lấy rate XU_TO_USD
      });

      if (!xuToUsdRateEntry || !xuToUsdRateEntry.rate) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi hệ thống: Không tìm thấy tỷ giá XU sang USD. Vui lòng liên hệ Admin.');
      }
      const conversionRate = parseFloat(xuToUsdRateEntry.rate);
      if (conversionRate <= 0) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi hệ thống: Tỷ giá XU sang USD không hợp lệ.');
      }

      // 2.2. Kiểm tra và Tính toán 2 TỔNG TIỀN
      let subTotalCoin = 0;
      let subTotalUsd = 0;
      const orderDetailsData = [];
      const itemUpdateOps = [];

      for (const cartItem of items) {
        const dbItem = dbItems.find((item) => item.id === cartItem.itemId);

        if (!dbItem) {
          throw new ApiError(httpStatus.NOT_FOUND, `Vật phẩm với ID ${cartItem.itemId} không tồn tại.`);
        }
        if (dbItem.stockQuantity < cartItem.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" không đủ số lượng (còn ${dbItem.stockQuantity}).`);
        }

        const hasCoinPrice = dbItem.priceCoin !== null;
        const hasUsdPrice = dbItem.priceUsd !== null;
        
        let price = 0;
        let currencyForThisItem = 'COIN'; // Mặc định

        if (preferredCurrency === 'USD' && hasUsdPrice) {
          // Ưu tiên 1: User muốn USD và vật phẩm CÓ giá USD
          price = parseFloat(dbItem.priceUsd);
          currencyForThisItem = 'USD';
          subTotalUsd += (price * cartItem.quantity);

        } else if (hasCoinPrice) {
          // Ưu tiên 2: User muốn COIN, HOẶC user muốn USD nhưng vật phẩm CHỈ CÓ giá COIN
          price = parseFloat(dbItem.priceCoin);
          currencyForThisItem = 'COIN';
          subTotalCoin += (price * cartItem.quantity);
          
        } else {
          // Lỗi: Vật phẩm không có giá COIN (và user cũng không thể mua bằng USD)
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" không có thông tin giá XU. Vui lòng liên hệ Admin.`);
        }

        const lineTotal = price * cartItem.quantity;

        orderDetailsData.push({
          itemId: dbItem.id,
          quantity: cartItem.quantity,
          priceAtPurchase: price,
          unitAtPurchase: dbItem.unit,
          currencyAtPurchase: currencyForThisItem, // [MỚI] Ghi lại tiền tệ
          totalLineAmount: lineTotal,
        });

        itemUpdateOps.push(
          tx.item.update({
            where: { id: dbItem.id },
            data: { stockQuantity: { decrement: cartItem.quantity } },
          })
        );
      }

      // 2.3. Tính toán giảm giá và tổng
      if (deliveryTimeSlotId !== "00000000-0000-0000-0000-000000000000") {
        const timeSlot = await tx.deliveryTimeSlot.findFirst({
          where: { id: deliveryTimeSlotId, isActive: true }
        });
        if (!timeSlot) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Khung giờ bạn chọn không còn hợp lệ. Vui lòng chọn lại.');
        }
      }
      
      // Tính toán giảm giá VIP (Chỉ áp dụng cho COIN)
      const vipDiscountPercent = user.vipLevel.discountPercent || 0;
      const vipDiscountAmountCoin = subTotalCoin * (vipDiscountPercent / 100);
      const totalAmountCoin = subTotalCoin - vipDiscountAmountCoin;
      
      // USD không được giảm giá
      const totalAmountUsd = subTotalUsd;

      // 2.4. TẠO ĐƠN HÀNG (Order)
      const createdOrder = await tx.order.create({
        data: {
          customerUserId: userId,
          inGameName: inGameName,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          deliveryTimeSlotId: deliveryTimeSlotId,

          // [SỬA] Lưu 2 loại tiền tệ
          subTotalCoin: subTotalCoin,
          vipDiscountAmountCoin: vipDiscountAmountCoin,
          totalAmountCoin: totalAmountCoin,
          
          subTotalUsd: subTotalUsd,
          totalAmountUsd: totalAmountUsd,

          orderDetails: {
            createMany: {
              data: orderDetailsData,
            },
          },
        },
        include: {
          orderDetails: true,
        },
      });

      // 2.5. THỰC THI CẬP NHẬT TỒN KHO
      await Promise.all(itemUpdateOps);

      // 2.6. [SỬA ĐỔI LỚN] Cập nhật tổng chi tiêu (quy đổi USD sang COIN)
      
      // [SỬA] Quy đổi giá trị USD đã chi tiêu sang XU (DÙNG PHÉP CHIA)
      const usdSpentInCoinValue = totalAmountUsd / conversionRate;

      // Tổng chi tiêu (đã quy đổi) để tính VIP
      const totalEquivalentSpent = totalAmountCoin + usdSpentInCoinValue;

      if (totalEquivalentSpent > 0) {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            totalSpentCoin: { 
              increment: totalEquivalentSpent // Dùng tổng đã quy đổi
            }
          },
          select: { totalSpentCoin: true } 
        });

        // Cập nhật VIP level dựa trên tổng chi tiêu mới (đã quy đổi)
        await updateUserVipLevel(tx, userId, updatedUser.totalSpentCoin);
      }
      
      return createdOrder;
    });

    return newOrder;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.code === 'P2025'|| error.code === 'P2018' ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Lỗi hệ thống: Không tìm thấy khung giờ giao hàng mặc định.');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Không thể tạo đơn hàng: ${error.message}`);
  }
};


/**
 * [SỬA] Lấy danh sách đơn hàng CỦA TÔI (cho Customer)
 * @param {string} userId - ID của user
 */
const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: { customerUserId: userId },
    orderBy: { createdAt: 'desc' },
    select: { // [SỬA] Cập nhật các trường theo schema mới
      id: true,
      status: true,
      paymentStatus: true,
      totalAmountCoin: true, // [SỬA]
      totalAmountUsd: true,  // [SỬA]
      createdAt: true,
    },
  });
};

/**
 * [SỬA] Lấy chi tiết 1 đơn hàng CỦA TÔI (cho Customer)
 * @param {string} orderId - ID đơn hàng
 * @param {string} userId - ID của user
 */
const getMyOrderById = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      customerUserId: userId, // Đảm bảo user này sở hữu đơn hàng
    },
    include: {
      deliveryTimeSlot: true, // Thêm dòng này để xem khung giờ
      orderDetails: {
        include: {
          item: { // Lấy thông tin vật phẩm lúc mua
            select: { id: true, name: true, thumbnailImageUrl: true }
          }
        }
      }
    }
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  return order;
};

/**
 * [MỚI] Lấy TẤT CẢ đơn hàng (cho Admin)
 */
const getAllOrdersAdmin = async () => {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { // Lấy thông tin người đặt
        select: { inGameName: true, email: true }
      }
    }
  });
};

/**
 * [MỚI] Lấy chi tiết 1 đơn hàng (cho Admin)
 * @param {string} orderId - ID đơn hàng
 */
const getOrderByIdAdmin = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { 
        select: { id: true, inGameName: true, email: true, vipLevelInt: true }
      },
      staff: { 
        select: { id: true, inGameName: true }
      },
      deliveryTimeSlot: true,
      orderDetails: {
        include: {
          item: { 
            select: { id: true, name: true, thumbnailImageUrl: true }
          }
        }
      }
    }
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  return order;
};

/**
 * [MỚI] Cập nhật 1 đơn hàng (cho Admin)
 * @param {string} orderId - ID đơn hàng
 * @param {object} updateBody - { status, paymentStatus }
 * @param {string} adminUserId - ID của admin/staff thực hiện
 */
const updateOrderAdmin = async (orderId, updateBody, adminUserId) => {
  const { status, paymentStatus } = updateBody;

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  // TODO: Thêm logic nghiệp vụ phức tạp ở đây
  // Ví dụ: Nếu chuyển status -> COMPLETED, phải kiểm tra paymentStatus == PAID
  // Víu dụ: Nếu chuyển status -> CANCELLED, phải hoàn lại stock

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: status, 
      paymentStatus: paymentStatus, 
      staffUserId: adminUserId, // Gán admin/staff xử lý đơn này
    },
  });
};


// Export tất cả các hàm
export const orderService = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderAdmin,
};