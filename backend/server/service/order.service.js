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
  const { items, inGameName, deliveryTimeSlotId, preferredCurrency } = orderData;

  // 1. Kiểm tra dữ liệu đầu vào cơ bản (Giữ nguyên)
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
      
      // [BẮT ĐẦU SỬA] LOGIC TẠO MÃ ĐƠN HÀNG (ORDER NUMBER)
      // 1. Lấy ngày giờ Việt Nam (UTC+7)
      const now = new Date();
      // Đảm bảo múi giờ đúng
      const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

      const year = vietnamTime.getFullYear().toString().slice(-2); // "25"
      const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0'); // "11"
      const day = vietnamTime.getDate().toString().padStart(2, '0'); // "10"
      
      const datePrefix = `${year}${month}${day}`; // "251110"

      // 2. Tìm đơn hàng cuối cùng trong ngày
      const lastOrderToday = await tx.order.findFirst({
        where: {
          orderNumber: {
            startsWith: datePrefix,
          },
        },
        orderBy: {
          orderNumber: 'desc', // Lấy số lớn nhất, vd: "2511100012"
        },
        select: {
          orderNumber: true,
        },
      });

      // 3. Tính toán số thứ tự mới
      let newSequence = 1;
      if (lastOrderToday && lastOrderToday.orderNumber) {
        // Tách 4 số cuối (an toàn hơn 3)
        const lastSequenceStr = lastOrderToday.orderNumber.slice(-4); // Lấy "0012"
        newSequence = parseInt(lastSequenceStr, 10) + 1;
      }

      // 4. Tạo mã mới (với 4 chữ số, cho phép 9999 đơn/ngày)
      const newOrderNumber = `${datePrefix}${newSequence.toString().padStart(4, '0')}`;
      // [KẾT THÚC SỬA] LOGIC TẠO MÃ ĐƠN HÀNG

      
      // 2.1. Lấy thông tin User (để tính VIP)
      const user = await tx.user.findFirstOrThrow({
        where: { id: userId },
        include: { vipLevel: true },
      });

      // ... (Tất cả logic: lấy itemIds, dbItems, tỷ giá, kiểm tra kho... giữ nguyên) ...
      const itemIds = items.map((item) => item.itemId);
      const dbItems = await tx.item.findMany({
        where: { id: { in: itemIds } },
      });

      const xuToUsdRateEntry = await tx.currencyExchangeRate.findUnique({
        where: { rateType: 'XU_TO_USD' }, 
      });

      if (!xuToUsdRateEntry || !xuToUsdRateEntry.rate) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi hệ thống: Không tìm thấy tỷ giá XU sang USD. Vui lòng liên hệ Admin.');
      }
      const conversionRate = parseFloat(xuToUsdRateEntry.rate);
      if (conversionRate <= 0) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi hệ thống: Tỷ giá XU sang USD không hợp lệ.');
      }

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
        let currencyForThisItem = 'COIN'; 

        if (preferredCurrency === 'USD' && hasUsdPrice) {
          price = parseFloat(dbItem.priceUsd);
          currencyForThisItem = 'USD';
          subTotalUsd += (price * cartItem.quantity);

        } else if (hasCoinPrice) {
          price = parseFloat(dbItem.priceCoin);
          currencyForThisItem = 'COIN';
          subTotalCoin += (price * cartItem.quantity);
          
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" không có thông tin giá XU. Vui lòng liên hệ Admin.`);
        }

        const lineTotal = price * cartItem.quantity;

        orderDetailsData.push({
          itemId: dbItem.id,
          quantity: cartItem.quantity,
          priceAtPurchase: price,
          unitAtPurchase: dbItem.unit,
          currencyAtPurchase: currencyForThisItem, 
          totalLineAmount: lineTotal,
        });

        itemUpdateOps.push(
          tx.item.update({
            where: { id: dbItem.id },
            data: { stockQuantity: { decrement: cartItem.quantity } },
          })
        );
      }
      
      if (deliveryTimeSlotId !== "00000000-0000-0000-0000-000000000000") {
        const timeSlot = await tx.deliveryTimeSlot.findFirst({
          where: { id: deliveryTimeSlotId, isActive: true }
        });
        if (!timeSlot) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Khung giờ bạn chọn không còn hợp lệ. Vui lòng chọn lại.');
        }
      }
      
      const vipDiscountPercent = user.vipLevel.discountPercent || 0;
      const vipDiscountAmountCoin = subTotalCoin * (vipDiscountPercent / 100);
      const totalAmountCoin = Math.ceil(subTotalCoin - vipDiscountAmountCoin);
      const totalAmountUsd = subTotalUsd;

      // 2.4. TẠO ĐƠN HÀNG (Order)
      const createdOrder = await tx.order.create({
        data: {
          // [THÊM DÒNG NÀY]
          orderNumber: newOrderNumber,
          
          customerUserId: userId,
          inGameName: inGameName,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          deliveryTimeSlotId: deliveryTimeSlotId,

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
      const usdSpentInCoinValue = totalAmountUsd / conversionRate;
      const totalEquivalentSpent = totalAmountCoin + usdSpentInCoinValue;

      if (totalEquivalentSpent > 0) {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            totalSpentCoin: { 
              increment: totalEquivalentSpent 
            }
          },
          select: { totalSpentCoin: true } 
        });
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
    select: { 
      id: true,
      
      // [THÊM DÒNG NÀY]
      orderNumber: true, 

      status: true,
      paymentStatus: true,
      totalAmountCoin: true, 
      totalAmountUsd: true,  
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
      customerUserId: userId, 
    },
    // [SỬA] Dùng 'include' sẽ tự động lấy 'orderNumber'
    include: {
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
 * [MỚI] Lấy TẤT CẢ đơn hàng (cho Admin)
 */
const getAllOrdersAdmin = async () => {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    // [SỬA] Dùng 'include' sẽ tự động lấy 'orderNumber'
    include: {
      customer: { 
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
    // [SỬA] Dùng 'include' sẽ tự động lấy 'orderNumber'
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
      staffUserId: adminUserId, 
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