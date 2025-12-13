// File: backend/server/service/export.service.js
// Service for exporting data to CSV format
import prisma from '../lib/prisma.js';

/**
 * Generate CSV string from data
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column definitions [{key, label}]
 */
const generateCSV = (data, columns) => {
    // BOM for UTF-8
    const BOM = '\uFEFF';

    // Header row
    const header = columns.map(col => `"${col.label}"`).join(',');

    // Data rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.key];

            // Handle nested values (e.g., 'user.email')
            if (col.key.includes('.')) {
                const keys = col.key.split('.');
                value = keys.reduce((obj, key) => obj?.[key], item);
            }

            // Format value
            if (value === null || value === undefined) {
                return '""';
            }
            if (value instanceof Date) {
                return `"${value.toISOString()}"`;
            }
            if (typeof value === 'string') {
                // Escape quotes
                return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${value}"`;
        }).join(',');
    });

    return BOM + [header, ...rows].join('\r\n');
};

/**
 * Export Orders to CSV
 * @param {object} filters - { status, paymentStatus, fromDate, toDate }
 */
export const exportOrdersCSV = async (filters = {}) => {
    const { status, paymentStatus, fromDate, toDate } = filters;

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            customer: { select: { email: true, inGameName: true } },
            staff: { select: { email: true } },
            deliveryTimeSlot: { select: { displayText: true } },
            orderDetails: {
                include: { item: { select: { name: true } } }
            }
        }
    });

    const columns = [
        { key: 'orderNumber', label: 'Mã đơn hàng' },
        { key: 'createdAt', label: 'Ngày tạo' },
        { key: 'inGameName', label: 'Tên trong game' },
        { key: 'customer.email', label: 'Email khách hàng' },
        { key: 'status', label: 'Trạng thái' },
        { key: 'paymentStatus', label: 'Thanh toán' },
        { key: 'totalAmountCoin', label: 'Tổng Xu' },
        { key: 'totalAmountUsd', label: 'Tổng USD' },
        { key: 'vipDiscountAmountCoin', label: 'Giảm giá VIP' },
        { key: 'deliveryTimeSlot.displayText', label: 'Khung giờ' },
        { key: 'staff.email', label: 'Nhân viên xử lý' },
        { key: 'itemCount', label: 'Số sản phẩm' },
        { key: 'itemList', label: 'Danh sách sản phẩm' }
    ];

    // Transform data
    const transformedData = orders.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        totalAmountCoin: parseFloat(order.totalAmountCoin),
        totalAmountUsd: parseFloat(order.totalAmountUsd),
        vipDiscountAmountCoin: parseFloat(order.vipDiscountAmountCoin),
        itemCount: order.orderDetails.length,
        itemList: order.orderDetails.map(d =>
            `${d.item?.name || 'Unknown'} x${d.quantity}`
        ).join('; ')
    }));

    return {
        csv: generateCSV(transformedData, columns),
        count: orders.length,
        filename: `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    };
};

/**
 * Export Inventory to CSV
 * @param {object} filters - { categoryId, lowStockOnly }
 */
export const exportInventoryCSV = async (filters = {}) => {
    const { categoryId, lowStockOnly, threshold = 10 } = filters;

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (lowStockOnly === 'true') where.stockQuantity = { lte: parseInt(threshold) };

    const items = await prisma.item.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
            category: { select: { name: true } }
        }
    });

    const columns = [
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'slug', label: 'Slug' },
        { key: 'unit', label: 'Đơn vị' },
        { key: 'category.name', label: 'Danh mục' },
        { key: 'priceCoin', label: 'Giá Xu' },
        { key: 'priceUsd', label: 'Giá USD' },
        { key: 'stockQuantity', label: 'Tồn kho' },
        { key: 'isActive', label: 'Trạng thái' },
        { key: 'createdAt', label: 'Ngày tạo' },
        { key: 'updatedAt', label: 'Cập nhật' }
    ];

    const transformedData = items.map(item => ({
        ...item,
        priceCoin: parseFloat(item.priceCoin) || 0,
        priceUsd: parseFloat(item.priceUsd) || 0,
        isActive: item.isActive ? 'Đang bán' : 'Ngừng bán',
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
    }));

    return {
        csv: generateCSV(transformedData, columns),
        count: items.length,
        filename: `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`
    };
};

/**
 * Export Users/Customers to CSV
 */
export const exportCustomersCSV = async () => {
    const users = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        orderBy: { createdAt: 'desc' },
        include: {
            vipLevel: { select: { name: true } }
        }
    });

    const columns = [
        { key: 'email', label: 'Email' },
        { key: 'inGameName', label: 'Tên trong game' },
        { key: 'vipLevel.name', label: 'Cấp VIP' },
        { key: 'totalSpentCoin', label: 'Tổng chi tiêu (Xu)' },
        { key: 'createdAt', label: 'Ngày đăng ký' }
    ];

    const transformedData = users.map(user => ({
        ...user,
        totalSpentCoin: parseFloat(user.totalSpentCoin),
        createdAt: new Date(user.createdAt)
    }));

    return {
        csv: generateCSV(transformedData, columns),
        count: users.length,
        filename: `customers_export_${new Date().toISOString().slice(0, 10)}.csv`
    };
};

export const exportService = {
    exportOrdersCSV,
    exportInventoryCSV,
    exportCustomersCSV
};
