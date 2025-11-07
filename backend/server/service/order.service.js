// File: backend/server/service/order.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';


// === HÀM HELPER MỚI (để trong cùng file) ===
/**
 * Cập nhật cấp độ VIP cho user dựa trên tổng chi tiêu
 * @param {object} tx - Prisma transaction client
 * @param {string} userId - ID của user
 * @param {number} newTotalSpent - Tổng chi tiêu MỚI
 */
const updateUserVipLevel = async (tx, userId, newTotalSpent) => {
  // 1. Lấy tất cả các cấp VIP, sắp xếp GIẢM DẦN
  const allVipLevels = await tx.vipLevel.findMany({
    orderBy: { minSpent: 'desc' },
  });

  // 2. Tìm cấp VIP cao nhất mà user đạt được
  let newVipLevelId = null;
  for (const level of allVipLevels) {
    if (newTotalSpent >= level.minSpent) {
      newVipLevelId = level.id;
      break; // Dừng ngay khi tìm thấy mốc cao nhất
    }
  }

  // 3. Cập nhật cho user nếu tìm thấy cấp VIP
  if (newVipLevelId) {
    await tx.user.update({
      where: { id: userId },
      data: { vipLevelId: newVipLevelId },
    });
  }
};
// === KẾT THÚC HÀM HELPER ===

/**
 * [GIỮ NGUYÊN] Tạo đơn hàng mới (cho Customer)
 * @param {string} userId - ID của user từ req.user
 * @param {object} orderData - Dữ liệu từ req.body (gồm items và inGameName)
 * @returns {Promise<object>} Đơn hàng vừa tạo
 */
const createOrder = async (userId, orderData) => {
  const { items, inGameName, deliveryTimeSlotId } = orderData;  // items là [{ itemId, quantity }, ...]

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
  // 2. Bắt đầu một GIAO DỊCH (TRANSACTION)
  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      // 2.1. Lấy thông tin User (để tính VIP) và các Items trong giỏ (để kiểm tra)
      const user = await tx.user.findFirstOrThrow({
        where: { id: userId },
        include: { vipLevel: true }, // Lấy thông tin vipLevel
      });

      const itemIds = items.map((item) => item.itemId);
      const dbItems = await tx.item.findMany({
        where: { id: { in: itemIds } },
      });

      // 2.2. Kiểm tra và Tính toán
      let subTotal = 0;
      const orderDetailsData = []; // Dữ liệu để tạo OrderDetail
      const itemUpdateOps = []; // Các lệnh để cập nhật tồn kho

      for (const cartItem of items) {
        const dbItem = dbItems.find((item) => item.id === cartItem.itemId);

        if (!dbItem) {
          throw new ApiError(httpStatus.NOT_FOUND, `Vật phẩm với ID ${cartItem.itemId} không tồn tại.`);
        }
        if (dbItem.stockQuantity < cartItem.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" không đủ số lượng (còn ${dbItem.stockQuantity}).`);
        }

        const price = parseFloat(dbItem.priceCoin || 0); // Chỉ dùng Xu
        const lineTotal = price * cartItem.quantity;
        subTotal += lineTotal;

        orderDetailsData.push({
          itemId: dbItem.id,
          quantity: cartItem.quantity,
          priceAtPurchase: price,
          unitAtPurchase: dbItem.unit, // [THÊM] Lưu lại unit lúc mua
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
      // [SỬA] Tính giảm giá từ vipLevel.discountPercent
      const vipDiscountPercent = user.vipLevel.discountPercent || 0;
      const vipDiscountAmount = subTotal * (vipDiscountPercent / 100);
      const totalAmount = subTotal - vipDiscountAmount;

      // 2.4. TẠO ĐƠN HÀNG (Order)
      const createdOrder = await tx.order.create({
        data: {
          customerUserId: userId, // [SỬA] Dùng customerUserId
          inGameName: inGameName,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          subTotal: subTotal,
          vipDiscountAmount: vipDiscountAmount,
          totalAmount: totalAmount,
          currencyUsed: 'COIN', // [SỬA] Dùng ENUM

          // [SỬA] Cần deliveryTimeSlotId (Lỗi: Hàm cũ thiếu)
          // Tạm thời hardcode, vì logic chọn time slot chưa làm
          deliveryTimeSlotId: deliveryTimeSlotId,// ID MẶC ĐỊNH - SẼ SỬA SAU

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

      // 2.6. [THÊM] Cập nhật tổng chi tiêu cho User
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalSpentCoin: {
            increment: totalAmount
          }
        },
        select: { totalSpentCoin: true } // Lấy ra tổng chi tiêu mới
      });

      await updateUserVipLevel(tx, userId, updatedUser.totalSpentCoin);
      return createdOrder;
    });

    return newOrder;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Bắt lỗi Prisma P2025 (Thiếu deliveryTimeSlotId) nếu bạn chưa seed
    if (error.code === 'P2025'|| error.code === 'P2018' ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Lỗi hệ thống: Không tìm thấy khung giờ giao hàng mặc định.');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Không thể tạo đơn hàng: ${error.message}`);
  }
};

// --- CÁC HÀM MỚI BẮT ĐẦU TỪ ĐÂY ---

/**
 * [MỚI] Lấy danh sách đơn hàng CỦA TÔI (cho Customer)
 * @param {string} userId - ID của user
 */
const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: { customerUserId: userId },
    orderBy: { createdAt: 'desc' },
    select: { // Chỉ lấy thông tin cần thiết cho trang danh sách
      id: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currencyUsed: true,
      createdAt: true,
    },
  });
};

/**
 * [MỚI] Lấy chi tiết 1 đơn hàng CỦA TÔI (cho Customer)
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
      customer: { // Lấy thông tin người đặt
        select: { id: true, inGameName: true, email: true, vipLevelInt: true }
      },
      staff: { // Lấy thông tin người xử lý
        select: { id: true, inGameName: true }
      },
      deliveryTimeSlot: true,
      orderDetails: {
        include: {
          item: { // Lấy thông tin vật phẩm
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

  // Lấy đơn hàng gốc để kiểm tra
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  // TODO: Thêm logic nghiệp vụ phức tạp ở đây
  // Ví dụ: Nếu chuyển status -> COMPLETED, phải kiểm tra paymentStatus == PAID
  // Ví dụ: Nếu chuyển status -> CANCELLED, phải hoàn lại stock
  // Tạm thời, chúng ta cho phép cập nhật đơn giản

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: status, // Cập nhật status nếu có
      paymentStatus: paymentStatus, // Cập nhật paymentStatus nếu có
      staffUserId: adminUserId, // Tự động gán admin/staff xử lý đơn này
    },
  });
};


// [SỬA] Export tất cả các hàm
export const orderService = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderAdmin,
};