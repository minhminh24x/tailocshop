// server/service/order.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
// [ĐÃ SỬA] Import ENUMs theo cách mới
import pkg from '@prisma/client';
const { StockReason, OrderStatus } = pkg;

/**
 * Tạo Đơn hàng mới (Logic phức tạp)
 * @param {string} userId - ID của khách hàng
 * @param {Object} orderData - Dữ liệu từ body (đã validate)
 * @returns {Promise<Order>}
 */
const createOrder = async (userId, orderData) => {
  const { deliveryTimeSlotId, currencyUsed, notes, items: cartItems } = orderData;

  // 1. Bắt đầu một Transaction
  // Điều này đảm bảo TẤT CẢ các thao tác DB hoặc cùng thành công, hoặc cùng thất bại
  return prisma.$transaction(async (tx) => {
    // 2. Lấy thông tin người dùng (Customer) và cấp VIP của họ
    const customer = await tx.user.findUnique({
      where: { id: userId },
      include: {
        vipLevel: true, // Để lấy discountPercent
      },
    });
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người dùng');
    }

    // 3. Lấy thông tin khung giờ giao hàng
    const deliverySlot = await tx.deliveryTimeSlot.findUnique({
      where: { id: deliveryTimeSlotId, isActive: true },
    });
    if (!deliverySlot) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Khung giờ giao hàng không hợp lệ hoặc đã bị tắt'
      );
    }

    // 4. Lấy thông tin TẤT CẢ item trong giỏ hàng từ DB
    const itemIds = cartItems.map((item) => item.itemId);
    const dbItems = await tx.item.findMany({
      where: {
        id: { in: itemIds },
        isActive: true, // Đảm bảo vật phẩm còn bán
      },
    });

    // 5. Tính toán, kiểm tra tồn kho và chuẩn bị dữ liệu
    let subTotal = 0;
    const orderDetailsData = [];
    const inventoryLogData = [];
    const stockUpdates = [];

    // Ánh xạ dbItems sang Map để tra cứu O(1)
    const dbItemsMap = new Map(dbItems.map((item) => [item.id, item]));

    for (const cartItem of cartItems) {
      const dbItem = dbItemsMap.get(cartItem.itemId);

      // 5a. Kiểm tra xem item có tồn tại hoặc còn bán không
      if (!dbItem) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Vật phẩm với ID ${cartItem.itemId} không tồn tại hoặc đã ngừng kinh doanh`
        );
      }

      // 5b. Kiểm tra tồn kho
      if (dbItem.stockQuantity < cartItem.quantity) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Vật phẩm "${dbItem.name}" không đủ số lượng tồn kho (chỉ còn ${dbItem.stockQuantity})`
        );
      }

      // 5c. Xác định giá dựa trên loại tiền tệ
      const priceField = currencyUsed === 'COIN' ? 'priceCoin' : 'priceUsd';
      const priceAtPurchase = dbItem[priceField];

      if (priceAtPurchase === null || priceAtPurchase <= 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Vật phẩm "${dbItem.name}" không thể mua bằng ${currencyUsed}`
        );
      }

      const totalLineAmount = Number(priceAtPurchase) * cartItem.quantity;
      subTotal += totalLineAmount;

      // 5d. Chuẩn bị data cho OrderDetail
      orderDetailsData.push({
        itemId: dbItem.id,
        quantity: cartItem.quantity,
        unitAtPurchase: dbItem.unit,
        priceAtPurchase: priceAtPurchase,
        totalLineAmount: totalLineAmount,
      });

      // 5e. Chuẩn bị data để cập nhật Stock
      stockUpdates.push(
        tx.item.update({
          where: { id: dbItem.id },
          data: {
            stockQuantity: {
              decrement: cartItem.quantity,
            },
          },
        })
      );
    }

    // 6. Tính toán giảm giá và Tổng cộng
    const vipDiscountPercent = customer.vipLevel.discountPercent || 0;
    const vipDiscountAmount = (subTotal * vipDiscountPercent) / 100;
    const totalAmount = subTotal - vipDiscountAmount;

    // 7. TẠO ĐƠN HÀNG (Order)
    const order = await tx.order.create({
      data: {
        customerUserId: customer.id,
        inGameName: customer.inGameName, // Lấy từ thông tin user
        deliveryTimeSlotId: deliverySlot.id,
        currencyUsed: currencyUsed,
        subTotal: subTotal,
        vipDiscountAmount: vipDiscountAmount,
        totalAmount: totalAmount,
        notes: notes,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        // 7a. Tạo lồng các OrderDetail
        orderDetails: {
          create: orderDetailsData,
        },
      },
    });

    // 8. CẬP NHẬT TỒN KHO (chạy song song các promise)
    await Promise.all(stockUpdates);

    // 9. TẠO LOG KHO (InventoryLog)
    // Lấy số lượng tồn kho MỚI sau khi đã trừ
    const updatedItems = await tx.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, stockQuantity: true },
    });
    const updatedStockMap = new Map(
      updatedItems.map((item) => [item.id, item.stockQuantity])
    );

    for (const detail of orderDetailsData) {
      inventoryLogData.push({
        itemId: detail.itemId,
        userId: customer.id, // Log này do user (customer) gây ra
        orderId: order.id, // Gắn ID đơn hàng
        quantityChange: -detail.quantity, // Số lượng thay đổi (âm)
        newStockQuantity: updatedStockMap.get(detail.itemId), // Số lượng sau khi trừ
        reason: StockReason.ORDER_FULFILLED, // Lý do
      });
    }

    await tx.inventoryLog.createMany({
      data: inventoryLogData,
    });

    // 10. Trả về đơn hàng đã tạo thành công
    return order;
  });
  // KẾT THÚC TRANSACTION
};

/**
 * Lấy các đơn hàng của TÔI (Customer)
 * @param {string} userId
 * @returns {Promise<Order[]>}
 */
const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: { customerUserId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      deliveryTimeSlot: {
        select: { displayText: true },
      },
    },
  });
};

/**
 * Lấy chi tiết 1 đơn hàng (Customer xem)
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<Order | null>}
 */
const getMyOrderById = async (orderId, userId) => {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      customerUserId: userId, // Đảm bảo user này sở hữu đơn hàng
    },
    include: {
      deliveryTimeSlot: true,
      orderDetails: {
        include: {
          item: true, // Lấy thông tin item (có thể select() để giảm bớt)
        },
      },
    },
  });
};

/**
 * Lấy TẤT CẢ đơn hàng (Admin)
 * @returns {Promise<Order[]>}
 */
const getAllOrdersAdmin = async () => {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        select: { id: true, inGameName: true, email: true },
      },
      staff: {
        select: { id: true, inGameName: true },
      },
    },
  });
};

/**
 * Lấy chi tiết 1 đơn hàng (Admin xem)
 * @param {string} orderId
 * @returns {Promise<Order | null>}
 */
const getOrderByIdAdmin = async (orderId) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true, // Lấy full info customer
      staff: true,
      deliveryTimeSlot: true,
      orderDetails: {
        include: {
          item: true,
        },
      },
    },
  });
};

/**
 * [HÀM MỚI] Admin cập nhật đơn hàng
 * @param {string} orderId
 * @param {Object} updateBody
 * @param {string} adminUserId - ID của Admin/Staff thực hiện
 * @returns {Promise<Order>}
 */
const updateOrderAdmin = async (orderId, updateBody, adminUserId) => {
  const { status, paymentStatus, staffUserId } = updateBody;

  // Lấy đơn hàng hiện tại VÀ các chi tiết của nó (để chuẩn bị hoàn kho nếu hủy)
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderDetails: true },
  });

  if (!existingOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }

  // ⭐️ Logic Nâng Cao: Xử lý HỦY ĐƠN (CANCELLED)
  // Nếu trạng thái mới là CANCELLED và trạng thái cũ KHÔNG PHẢI là CANCELLED
  if (
    status === OrderStatus.CANCELLED &&
    existingOrder.status !== OrderStatus.CANCELLED
  ) {
    // Chúng ta cần HOÀN LẠI HÀNG VÀO KHO
    return prisma.$transaction(async (tx) => {
      const stockUpdates = [];
      const inventoryLogData = [];

      for (const detail of existingOrder.orderDetails) {
        // 1. Chuẩn bị promise cộng hàng lại vào kho
        stockUpdates.push(
          tx.item.update({
            where: { id: detail.itemId },
            data: {
              stockQuantity: {
                increment: detail.quantity,
              },
            },
            select: { id: true, stockQuantity: true }, // Lấy stock mới
          })
        );
      }
      
      // 2. Chạy tất cả các promise cập nhật kho
      const updatedItems = await Promise.all(stockUpdates);
      const updatedStockMap = new Map(
        updatedItems.map((item) => [item.id, item.stockQuantity])
      );

      // 3. Chuẩn bị log hoàn kho
      for (const detail of existingOrder.orderDetails) {
        inventoryLogData.push({
          itemId: detail.itemId,
          userId: adminUserId, // Admin là người gây ra log này
          orderId: orderId, // Ghi nhận cho đơn hàng nào
          quantityChange: detail.quantity, // Số lượng thay đổi (dương)
          newStockQuantity: updatedStockMap.get(detail.itemId), // Số lượng mới
          reason: StockReason.ADMIN_ADJUSTMENT, // Lý do: Admin điều chỉnh (Hủy đơn)
          notes: 'Hoàn kho do hủy đơn hàng',
        });
      }

      // 4. Tạo log
      await tx.inventoryLog.createMany({
        data: inventoryLogData,
      });

      // 5. Cập nhật đơn hàng sang CANCELLED và gán Staff
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: paymentStatus || existingOrder.paymentStatus,
          staffUserId: staffUserId || adminUserId, // Gán người hủy đơn
        },
      });

      return updatedOrder;
    }); // Kết thúc Transaction
  }

  // Nếu là cập nhật trạng thái thông thường (không phải Hủy)
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: status,
      paymentStatus: paymentStatus,
      // Gán staff nếu admin chọn, nếu không thì gán chính admin/staff đang cập nhật
      staffUserId: staffUserId || adminUserId,
    },
  });
};

export const orderService = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderAdmin,
};