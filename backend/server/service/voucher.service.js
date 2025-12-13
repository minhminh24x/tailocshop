// File: backend/server/service/voucher.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * [Admin] Lấy tất cả vouchers
 * @param {object} query - { page, limit, isActive }
 */
const getAllVouchers = async (query = {}) => {
    const { page = 1, limit = 20, isActive } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }

    const [vouchers, total] = await Promise.all([
        prisma.voucher.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        }),
        prisma.voucher.count({ where })
    ]);

    return {
        data: vouchers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / take)
        }
    };
};

/**
 * [Admin] Lấy chi tiết voucher
 * @param {string} voucherId 
 */
const getVoucherById = async (voucherId) => {
    const voucher = await prisma.voucher.findUnique({
        where: { id: voucherId }
    });

    if (!voucher) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy mã giảm giá');
    }

    return voucher;
};

/**
 * [Admin] Tạo voucher mới
 * @param {object} voucherData 
 */
const createVoucher = async (voucherData) => {
    const {
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        usageLimit,
        isActive,
        startDate,
        endDate
    } = voucherData;

    // Validate code unique
    const existing = await prisma.voucher.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã giảm giá đã tồn tại');
    }

    // Validate discount value
    if (discountType === 'PERCENTAGE' && discountValue > 100) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Giảm giá theo % không được vượt quá 100');
    }

    return prisma.voucher.create({
        data: {
            code: code.toUpperCase(),
            description,
            discountType: discountType || 'PERCENTAGE',
            discountValue,
            minOrderValue,
            maxDiscount,
            usageLimit,
            isActive: isActive !== false,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
        }
    });
};

/**
 * [Admin] Cập nhật voucher
 * @param {string} voucherId 
 * @param {object} updateData 
 */
const updateVoucher = async (voucherId, updateData) => {
    const voucher = await getVoucherById(voucherId);

    const {
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        usageLimit,
        isActive,
        startDate,
        endDate
    } = updateData;

    // Check code unique if changed
    if (code && code.toUpperCase() !== voucher.code) {
        const existing = await prisma.voucher.findUnique({
            where: { code: code.toUpperCase() }
        });
        if (existing) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Mã giảm giá đã tồn tại');
        }
    }

    return prisma.voucher.update({
        where: { id: voucherId },
        data: {
            ...(code && { code: code.toUpperCase() }),
            ...(description !== undefined && { description }),
            ...(discountType && { discountType }),
            ...(discountValue !== undefined && { discountValue }),
            ...(minOrderValue !== undefined && { minOrderValue }),
            ...(maxDiscount !== undefined && { maxDiscount }),
            ...(usageLimit !== undefined && { usageLimit }),
            ...(isActive !== undefined && { isActive }),
            ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
            ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        }
    });
};

/**
 * [Admin] Xóa voucher
 * @param {string} voucherId 
 */
const deleteVoucher = async (voucherId) => {
    await getVoucherById(voucherId);

    await prisma.voucher.delete({
        where: { id: voucherId }
    });

    return { message: 'Xóa mã giảm giá thành công' };
};

/**
 * [Customer] Kiểm tra và validate voucher
 * @param {string} code - Mã voucher
 * @param {number} orderTotal - Tổng tiền đơn hàng (tính bằng COIN)
 */
const validateVoucher = async (code, orderTotal) => {
    const voucher = await prisma.voucher.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!voucher) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Mã giảm giá không tồn tại');
    }

    // Check active
    if (!voucher.isActive) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã giảm giá đã hết hiệu lực');
    }

    // Check start date
    if (voucher.startDate && new Date() < voucher.startDate) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã giảm giá chưa có hiệu lực');
    }

    // Check end date
    if (voucher.endDate && new Date() > voucher.endDate) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã giảm giá đã hết hạn');
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã giảm giá đã hết lượt sử dụng');
    }

    // Check minimum order value
    if (voucher.minOrderValue && orderTotal < parseFloat(voucher.minOrderValue)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Đơn hàng phải từ ${voucher.minOrderValue} xu để áp dụng mã này`
        );
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
        discountAmount = orderTotal * (parseFloat(voucher.discountValue) / 100);
        // Apply max discount cap
        if (voucher.maxDiscount && discountAmount > parseFloat(voucher.maxDiscount)) {
            discountAmount = parseFloat(voucher.maxDiscount);
        }
    } else {
        // FIXED_COIN
        discountAmount = parseFloat(voucher.discountValue);
    }

    // Don't discount more than order total
    if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
    }

    return {
        valid: true,
        voucher: {
            id: voucher.id,
            code: voucher.code,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
        },
        discountAmount: Math.round(discountAmount), // Round to integer
        finalTotal: Math.round(orderTotal - discountAmount)
    };
};

/**
 * Sử dụng voucher (tăng usedCount)
 * @param {string} voucherId 
 */
const useVoucher = async (voucherId) => {
    return prisma.voucher.update({
        where: { id: voucherId },
        data: {
            usedCount: { increment: 1 }
        }
    });
};

export const voucherService = {
    getAllVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
    useVoucher,
};
