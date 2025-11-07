// File: backend/server/service/order.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * [SỬA ĐỔI] Viết lại hàm createOrder để sử dụng Interactive Transaction
 * * @param {string} userId - ID của user từ req.user
 * @param {object} orderData - Dữ liệu từ req.body (gồm items và inGameName)
 * @returns {Promise<object>} Đơn hàng vừa tạo
 */
const createOrder = async (userId, orderData) => {
  const { items, inGameName } = orderData; // items là [{ itemId, quantity }, ...]

  // 1. Kiểm tra dữ liệu đầu vào cơ bản
  if (!items || items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Giỏ hàng không được rỗng');
  }
  if (!inGameName || inGameName.trim() === '') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng nhập tên trong game');
  }

  // 2. Bắt đầu một GIAO DỊCH (TRANSACTION)
  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      // 2.1. Lấy thông tin User (để tính VIP) và các Items trong giỏ (để kiểm tra)
      // Dùng `findFirstOrThrow` để nếu user không tồn tại, nó sẽ tự động báo lỗi
      const user = await tx.user.findFirstOrThrow({
        where: { id: userId },
        select: { vipLevel: true },
      });

      const itemIds = items.map((item) => item.itemId);
      // Lấy TẤT CẢ item trong giỏ từ DB để kiểm tra.
      // Quan trọng: Prisma tự động thêm "SELECT... FOR UPDATE" khi
      // chúng ta đọc và sau đó cập nhật trong cùng một interactive transaction,
      // giúp giải quyết vấn đề Race Condition!
      const dbItems = await tx.item.findMany({
        where: { id: { in: itemIds } },
      });

      // 2.2. Kiểm tra và Tính toán
      let subTotal = 0;
      const orderDetailsData = []; // Dữ liệu để tạo OrderDetail
      const itemUpdateOps = []; // Các lệnh để cập nhật tồn kho

      for (const cartItem of items) {
        const dbItem = dbItems.find((item) => item.id === cartItem.itemId);

        // Lỗi 1: Vật phẩm không tồn tại
        if (!dbItem) {
          throw new ApiError(httpStatus.NOT_FOUND, `Vật phẩm với ID ${cartItem.itemId} không tồn tại.`);
        }

        // Lỗi 2: HẾT HÀNG (Đây là bước kiểm tra quan trọng)
        if (dbItem.stockQuantity < cartItem.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Vật phẩm "${dbItem.name}" đã hết hàng hoặc không đủ số lượng.`);
        }
        
        const price = parseFloat(dbItem.priceCoin || dbItem.priceUsd || 0); // Ưu tiên Coin
        const lineTotal = price * cartItem.quantity;
        subTotal += lineTotal;

        // Chuẩn bị data cho 'OrderDetail'
        orderDetailsData.push({
          itemId: dbItem.id,
          quantity: cartItem.quantity,
          priceAtPurchase: price,
          totalLineAmount: lineTotal,
        });

        // Chuẩn bị lệnh để 'giảm tồn kho'
        itemUpdateOps.push(
          tx.item.update({
            where: { id: dbItem.id },
            data: {
              stockQuantity: {
                decrement: cartItem.quantity,
              },
            },
          })
        );
      } // Kết thúc vòng lặp kiểm tra giỏ hàng

      // 2.3. Tính toán giảm giá và tổng
      const vipDiscountRate = (user.vipLevel || 0) * 0.05; // 5% mỗi level VIP
      const vipDiscountAmount = subTotal * vipDiscountRate;
      const totalAmount = subTotal - vipDiscountAmount;

      // 2.4. TẠO ĐƠN HÀNG (Order) và Chi tiết Đơn hàng (OrderDetail)
      const createdOrder = await tx.order.create({
        data: {
          userId: userId,
          inGameName: inGameName,
          status: 'PENDING', // Mặc định là PENDING
          paymentStatus: 'UNPAID', // Mặc định là UNPAID
          subTotal: subTotal,
          vipDiscountAmount: vipDiscountAmount,
          totalAmount: totalAmount,
          currencyUsed: 'Xu', // Giả sử chỉ dùng Xu
          // Tạo các OrderDetail lồng nhau
          orderDetails: {
            createMany: {
              data: orderDetailsData,
            },
          },
        },
        include: {
          orderDetails: true, // Trả về chi tiết đơn hàng
        },
      });

      // 2.5. THỰC THI CẬP NHẬT TỒN KHO
      // (Chỉ chạy sau khi tạo Order thành công)
      await Promise.all(itemUpdateOps);

      // 2.6. Trả về đơn hàng
      return createdOrder;
    }); // KẾT THÚC TRANSACTION

    return newOrder;

  } catch (error) {
    // Nếu có bất kỳ lỗi nào (ApiError, lỗi Prisma...), transaction sẽ tự động ROLLBACK
    if (error instanceof ApiError) {
      throw error; // Ném lại lỗi (vd: Hết hàng) để controller bắt
    }
    // Các lỗi chung khác
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Không thể tạo đơn hàng: ${error.message}`);
  }
};

// (Các hàm khác 'getOrders', 'getOrderById', 'updateOrderStatus' giữ nguyên)
// ...
export const orderService = {
  createOrder,
  // ... các hàm khác
};