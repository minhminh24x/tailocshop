// File: backend/server/service/order.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { emitNewOrder, emitOrderStatusChange, emitLowStockAlert } from '../lib/socket.js';

// === HÀM HELPER (Giữ nguyên) ===
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
 * [ĐÃ SỬA] Tạo đơn hàng mới
 * - Thêm: Ghi log xuất kho (InventoryLog)
 * - Xóa: Logic cộng điểm VIP (chuyển sang updateOrderAdmin)
 */
const createOrder = async (userId, orderData) => {
  const { items, inGameName, deliveryTimeSlotId, preferredCurrency } = orderData;

  // 1. Kiểm tra dữ liệu đầu vào (Giữ nguyên)
  if (!items || items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Giỏ hàng không được rỗng');
  }
  // ... (các kiểm tra khác giữ nguyên)
  if (!inGameName || inGameName.trim() === '') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng nhập tên trong game');
  }
  if (!deliveryTimeSlotId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng chọn khung giờ giao hàng');
  }
  if (!preferredCurrency || !['COIN', 'USD'].includes(preferredCurrency)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng chọn loại tiền tệ ưu tiên (COIN hoặc USD)');
  }

  // 2. Bắt đầu GIAO DỊCH
  try {
    const newOrder = await prisma.$transaction(async (tx) => {

      // [LOGIC TẠO MÃ ĐƠN HÀNG] (Giữ nguyên)
      const now = new Date();
      const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const year = vietnamTime.getFullYear().toString().slice(-2);
      const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0');
      const day = vietnamTime.getDate().toString().padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;
      const lastOrderToday = await tx.order.findFirst({
        where: { orderNumber: { startsWith: datePrefix } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      let newSequence = 1;
      if (lastOrderToday && lastOrderToday.orderNumber) {
        const lastSequenceStr = lastOrderToday.orderNumber.slice(-4);
        newSequence = parseInt(lastSequenceStr, 10) + 1;
      }
      const newOrderNumber = `${datePrefix}${newSequence.toString().padStart(4, '0')}`;

      // 2.1. Lấy thông tin User (vẫn cần để tính discount)
      const user = await tx.user.findFirstOrThrow({
        where: { id: userId },
        include: { vipLevel: true },
      });

      // 2.2. Lấy thông tin Items và Tỷ giá (Giữ nguyên)
      const itemIds = items.map((item) => item.itemId);
      const dbItems = await tx.item.findMany({
        where: { id: { in: itemIds } },
      });
      const xuToUsdRateEntry = await tx.currencyExchangeRate.findUnique({
        where: { rateType: 'XU_TO_USD' },
      });
      if (!xuToUsdRateEntry || !xuToUsdRateEntry.rate) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi hệ thống: Không tìm thấy tỷ giá XU sang USD.');
      }
      // const conversionRate = parseFloat(xuToUsdRateEntry.rate); // Dùng cho phần sau

      // 2.3. Tính toán và kiểm tra kho (Sửa đổi)
      let subTotalCoin = 0;
      let subTotalUsd = 0;
      const orderDetailsData = [];

      // [SỬA ĐỔI] Chúng ta cần một mảng riêng để cập nhật kho
      const itemsToUpdateStock = [];

      for (const cartItem of items) {
        const dbItem = dbItems.find((item) => item.id === cartItem.itemId);
        // ... (Kiểm tra !dbItem, kiểm tra stockQuantity giữ nguyên)
        if (!dbItem) {
          throw new ApiError(httpStatus.NOT_FOUND, `Vật phẩm với ID ${cartItem.itemId} không tồn tại.`);
        }
        if (dbItem.stockQuantity < cartItem.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" không đủ số lượng (còn ${dbItem.stockQuantity}).`);
        }

        // ... (Logic tính giá, preferredCurrency giữ nguyên)
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
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" không có thông tin giá XU.`);
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

        // [SỬA] Thêm vào mảng để cập nhật stock
        itemsToUpdateStock.push({
          id: dbItem.id,
          quantityToDecrement: cartItem.quantity,
        });
      }

      // ... (Kiểm tra timeSlot giữ nguyên)
      if (deliveryTimeSlotId !== "00000000-0000-0000-0000-000000000000") {
        const timeSlot = await tx.deliveryTimeSlot.findFirst({
          where: { id: deliveryTimeSlotId, isActive: true }
        });
        if (!timeSlot) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Khung giờ bạn chọn không còn hợp lệ. Vui lòng chọn lại.');
        }
      }

      // 2.4. Tính toán tổng đơn hàng (Giữ nguyên)
      const vipDiscountPercent = user.vipLevel.discountPercent || 0;
      const vipDiscountAmountCoin = subTotalCoin * (vipDiscountPercent / 100);
      const totalAmountCoin = Math.ceil(subTotalCoin - vipDiscountAmountCoin);
      const totalAmountUsd = subTotalUsd;

      // 2.5. TẠO ĐƠN HÀNG (Order)
      const createdOrder = await tx.order.create({
        data: {
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
          // [THÊM] Timeline: Set pendingAt khi tạo đơn
          pendingAt: new Date(),
          orderDetails: {
            createMany: {
              data: orderDetailsData,
            },
          },
        },
        include: {
          // [THÊM] Cần include orderDetails để ghi log kho
          orderDetails: true,
        },
      });

      // 2.6. [NÂNG CẤP] THỰC THI CẬP NHẬT TỒN KHO VÀ GHI LOG KHO
      const itemUpdateOps = [];

      // Tạo các lệnh cập nhật kho
      for (const item of itemsToUpdateStock) {
        itemUpdateOps.push(
          tx.item.update({
            where: { id: item.id },
            data: { stockQuantity: { decrement: item.quantityToDecrement } },
            select: { id: true, stockQuantity: true } // Lấy stock mới
          })
        );
      }

      // Chạy cập nhật kho
      const updatedItems = await Promise.all(itemUpdateOps);

      // Tạo các lệnh ghi log kho
      const logCreationOps = updatedItems.map((updatedItem) => {
        // Lấy lại thông tin từ orderDetails để đảm bảo
        const detail = createdOrder.orderDetails.find(d => d.itemId === updatedItem.id);

        return tx.inventoryLog.create({
          data: {
            itemId: updatedItem.id,
            userId: userId, // ID của customer thực hiện
            orderId: createdOrder.id, //
            quantityChange: -detail.quantity, // (Trừ kho)
            newStockQuantity: updatedItem.stockQuantity, // (Stock sau khi trừ)
            reason: 'ORDER_FULFILLED', //
          }
        });
      });

      // Chạy ghi log kho
      await Promise.all(logCreationOps);

      // 2.7. [ĐÃ XÓA] LOGIC CẬP NHẬT VIP
      // Toàn bộ khối logic (totalEquivalentSpent, user.update, updateUserVipLevel)
      // đã được xóa khỏi đây.

      return createdOrder;
    });

    // [THÊM] Emit real-time event for new order
    try {
      emitNewOrder(newOrder);
    } catch (e) {
      console.error('[Socket.io] Failed to emit new order:', e.message);
    }

    return newOrder;

  } catch (error) {
    // ... (Khối catch giữ nguyên)
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.code === 'P2025' || error.code === 'P2018') {
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
 * [NÂNG CẤP] Lấy đơn hàng (cho Admin) với Pagination và Filter
 * @param {object} query - { page, limit, status, paymentStatus, fromDate, toDate }
 */
const getAllOrdersAdmin = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    fromDate,
    toDate,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where = {};
  if (status) {
    where.status = status;
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) {
      where.createdAt.gte = new Date(fromDate);
    }
    if (toDate) {
      where.createdAt.lte = new Date(toDate);
    }
  }

  // Get total count for pagination
  const total = await prisma.order.count({ where });

  // Get paginated orders
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      customer: {
        select: { inGameName: true, email: true }
      }
    }
  });

  return {
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / take),
    }
  };
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
 * [NÂNG CẤP LỚN] Cập nhật 1 đơn hàng (cho Admin)
 * - Thêm: Chặn sửa đơn hàng đã chốt (COMPLETED, CANCELLED).
 * - Thêm: Hoàn kho (InventoryLog) khi chuyển sang CANCELLED.
 * - Thêm: Cộng điểm VIP (totalSpentCoin) khi chuyển sang COMPLETED.
 * * @param {string} orderId - ID đơn hàng
 * @param {object} updateBody - { status, paymentStatus }
 * @param {string} adminUserId - ID của admin/staff thực hiện
 */
const updateOrderAdmin = async (orderId, updateBody, adminUserId) => {
  const { status, paymentStatus } = updateBody;

  // 1. Lấy trạng thái đơn hàng HIỆN TẠI
  // Cần include orderDetails (để hoàn kho) và customer (để cộng VIP)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderDetails: true, //
      customer: true, //
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  // 2. [YÊU CẦU] Chặn cập nhật nếu đơn hàng đã chốt
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy.'
    );
  }

  // 3. Bắt đầu GIAO DỊCH để đảm bảo toàn vẹn dữ liệu
  return prisma.$transaction(async (tx) => {

    // 4. [YÊU CẦU] XỬ LÝ LOGIC HỦY ĐƠN (HOÀN KHO)
    // Chỉ chạy khi trạng thái MỚI là CANCELLED
    if (status === 'CANCELLED') {
      const itemUpdates = [];
      const inventoryLogs = [];

      // Loop qua các sản phẩm trong đơn hàng
      for (const detail of order.orderDetails) {
        itemUpdates.push(
          tx.item.update({
            where: { id: detail.itemId },
            data: { stockQuantity: { increment: detail.quantity } }, // Hoàn kho (tăng)
            select: { id: true, stockQuantity: true },
          })
        );
      }

      const updatedItems = await Promise.all(itemUpdates);

      // Ghi log việc hoàn kho này
      updatedItems.forEach((item, index) => {
        const detail = order.orderDetails.find(d => d.itemId === item.id); // Tìm đúng detail
        inventoryLogs.push(
          tx.inventoryLog.create({
            data: {
              itemId: detail.itemId,
              userId: adminUserId, // Admin là người thực hiện
              orderId: order.id, //
              quantityChange: detail.quantity, // (Số dương)
              newStockQuantity: item.stockQuantity, //
              reason: 'ADMIN_ADJUSTMENT', //
              notes: 'Hoàn kho do admin hủy đơn hàng', //
            },
          })
        );
      });
      await Promise.all(inventoryLogs);
    }

    // 5. [YÊU CẦU] XỬ LÝ LOGIC HOÀN THÀNH (CỘNG ĐIỂM VIP)
    // Chỉ chạy khi trạng thái MỚI là COMPLETED
    if (status === 'COMPLETED') {
      // Kiểm tra thanh toán
      // Đơn hàng phải được đánh dấu là PAID (hoặc trong body, hoặc đã PAID từ trước)
      const isPaid = (paymentStatus === 'PAID' || order.paymentStatus === 'PAID');
      if (!isPaid) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Không thể hoàn thành đơn hàng chưa thanh toán.'
        );
      }

      // Chỉ cộng điểm nếu đơn hàng có gắn với 1 customer
      if (order.customerUserId && order.customer) {
        // Lấy tỷ giá (bắt buộc)
        const xuToUsdRateEntry = await tx.currencyExchangeRate.findUnique({
          where: { rateType: 'XU_TO_USD' },
        });

        if (!xuToUsdRateEntry || !xuToUsdRateEntry.rate || parseFloat(xuToUsdRateEntry.rate) <= 0) {
          // Nếu lỗi tỷ giá, chúng ta rollback transaction
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi hệ thống: Tỷ giá XU sang USD không hợp lệ. Không thể cộng điểm VIP.');
        }

        const conversionRate = parseFloat(xuToUsdRateEntry.rate);

        // Tính tổng chi tiêu quy đổi
        const usdSpentInCoinValue = parseFloat(order.totalAmountUsd) / conversionRate; //
        const totalEquivalentSpent = parseFloat(order.totalAmountCoin) + usdSpentInCoinValue; //

        if (totalEquivalentSpent > 0) {
          // Cập nhật tổng chi tiêu cho user
          const updatedUser = await tx.user.update({
            where: { id: order.customerUserId },
            data: {
              totalSpentCoin: {
                increment: totalEquivalentSpent,
              },
            },
            select: { totalSpentCoin: true },
          });

          // Cập nhật lại cấp VIP
          await updateUserVipLevel(tx, order.customerUserId, updatedUser.totalSpentCoin);
        }
      }
    }

    // 6. Cập nhật trạng thái cuối cùng cho đơn hàng
    // [THÊM] Xây dựng data object với timeline
    const updateData = {
      status: status,
      paymentStatus: paymentStatus,
      staffUserId: adminUserId, // Ghi lại admin đã xử lý
    };

    // [THÊM] Set timeline timestamp dựa trên status mới
    if (status) {
      const now = new Date();
      switch (status) {
        case 'PENDING':
          updateData.pendingAt = now;
          break;
        case 'PREPARING':
          updateData.preparingAt = now;
          break;
        case 'READY_FOR_DELIVERY':
          updateData.readyForDeliveryAt = now;
          break;
        case 'COMPLETED':
          updateData.completedAt = now;
          break;
        case 'CANCELLED':
          updateData.cancelledAt = now;
          break;
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // [THÊM] Emit real-time event for order status change
    try {
      emitOrderStatusChange({
        ...updatedOrder,
        customerUserId: order.customerUserId
      });
    } catch (e) {
      console.error('[Socket.io] Failed to emit order status:', e.message);
    }

    return updatedOrder;
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