// File: backend/server/service/stats.service.js
import prisma from '../lib/prisma.js';

/**
 * Lấy thống kê tổng quan cho Admin Dashboard
 * @returns {Promise<object>}
 */
const getDashboardStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Chạy các query song song để tối ưu performance
    const [
        totalOrders,
        ordersThisMonth,
        ordersLastMonth,
        pendingOrders,
        newCustomersThisMonth,
        newCustomersLastMonth,
        totalCustomers,
        completedOrdersThisMonth,
        completedOrdersLastMonth,
        totalInventory,
        lowStockItems,
    ] = await Promise.all([
        // 1. Tổng số đơn hàng
        prisma.order.count(),

        // 2. Đơn hàng tháng này
        prisma.order.count({
            where: {
                createdAt: { gte: startOfMonth }
            }
        }),

        // 3. Đơn hàng tháng trước (để tính % thay đổi)
        prisma.order.count({
            where: {
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        }),

        // 4. Đơn hàng đang chờ xử lý
        prisma.order.count({
            where: { status: 'PENDING' }
        }),

        // 5. Khách hàng mới tháng này
        prisma.user.count({
            where: {
                role: 'CUSTOMER',
                createdAt: { gte: startOfMonth }
            }
        }),

        // 6. Khách hàng mới tháng trước
        prisma.user.count({
            where: {
                role: 'CUSTOMER',
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        }),

        // 7. Tổng số khách hàng
        prisma.user.count({
            where: { role: 'CUSTOMER' }
        }),

        // 8. Doanh thu tháng này (đơn COMPLETED)
        prisma.order.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: startOfMonth }
            },
            _sum: {
                totalAmountCoin: true,
                totalAmountUsd: true,
            }
        }),

        // 9. Doanh thu tháng trước
        prisma.order.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            },
            _sum: {
                totalAmountCoin: true,
                totalAmountUsd: true,
            }
        }),

        // 10. Tổng số lượng tồn kho
        prisma.item.aggregate({
            where: { isActive: true },
            _sum: { stockQuantity: true }
        }),

        // 11. Sản phẩm sắp hết hàng (< 10)
        prisma.item.count({
            where: {
                isActive: true,
                stockQuantity: { lte: 10 }
            }
        }),
    ]);

    // Tính toán % thay đổi
    const calcChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const revenueThisMonth = parseFloat(completedOrdersThisMonth._sum.totalAmountCoin || 0);
    const revenueLastMonth = parseFloat(completedOrdersLastMonth._sum.totalAmountCoin || 0);
    const revenueUsdThisMonth = parseFloat(completedOrdersThisMonth._sum.totalAmountUsd || 0);

    return {
        // Thống kê đơn hàng
        orders: {
            total: totalOrders,
            thisMonth: ordersThisMonth,
            pending: pendingOrders,
            changePercent: calcChange(ordersThisMonth, ordersLastMonth),
        },

        // Thống kê khách hàng
        customers: {
            total: totalCustomers,
            newThisMonth: newCustomersThisMonth,
            changePercent: calcChange(newCustomersThisMonth, newCustomersLastMonth),
        },

        // Thống kê doanh thu
        revenue: {
            coinThisMonth: revenueThisMonth,
            usdThisMonth: revenueUsdThisMonth,
            changePercent: calcChange(revenueThisMonth, revenueLastMonth),
        },

        // Thống kê kho
        inventory: {
            totalStock: totalInventory._sum.stockQuantity || 0,
            lowStockCount: lowStockItems,
        },

        // Metadata
        generatedAt: new Date().toISOString(),
    };
};

/**
 * Lấy đơn hàng gần đây cho Dashboard
 * @param {number} limit - Số lượng đơn hàng cần lấy
 */
const getRecentOrders = async (limit = 5) => {
    return prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            totalAmountCoin: true,
            totalAmountUsd: true,
            createdAt: true,
            customer: {
                select: { inGameName: true }
            }
        }
    });
};

/**
 * Lấy sản phẩm sắp hết hàng
 * @param {number} threshold - Ngưỡng số lượng
 * @param {number} limit - Số lượng items cần lấy
 */
const getLowStockItems = async (threshold = 10, limit = 10) => {
    return prisma.item.findMany({
        where: {
            isActive: true,
            stockQuantity: { lte: threshold }
        },
        take: limit,
        orderBy: { stockQuantity: 'asc' },
        select: {
            id: true,
            name: true,
            stockQuantity: true,
            thumbnailImageUrl: true,
        }
    });
};

export const statsService = {
    getDashboardStats,
    getRecentOrders,
    getLowStockItems,
};
