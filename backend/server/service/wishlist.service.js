// File: backend/server/service/wishlist.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Lấy danh sách wishlist của user
 * @param {string} userId 
 */
const getMyWishlist = async (userId) => {
    return prisma.wishlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            item: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    allowedUnits: true,    // [SỬA] Từ unit
                    baseUnit: true,        // [MỚI]
                    thumbnailImageUrl: true,
                    basePriceCoin: true,   // [SỬA] Từ priceCoin
                    basePriceUsd: true,    // [SỬA] Từ priceUsd
                    priceCoin: true,       // Giữ lại cho backward compat
                    priceUsd: true,
                    stockQuantity: true,
                    isActive: true,
                }
            }
        }
    });
};

/**
 * Thêm item vào wishlist
 * @param {string} userId 
 * @param {string} itemId 
 */
const addToWishlist = async (userId, itemId) => {
    // Kiểm tra item tồn tại
    const item = await prisma.item.findUnique({
        where: { id: itemId }
    });

    if (!item) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy vật phẩm');
    }

    // Kiểm tra đã có trong wishlist chưa
    const existing = await prisma.wishlist.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Vật phẩm đã có trong danh sách yêu thích');
    }

    return prisma.wishlist.create({
        data: {
            userId,
            itemId
        },
        include: {
            item: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    allowedUnits: true,  // [SỬA]
                    baseUnit: true,      // [MỚI]
                    thumbnailImageUrl: true,
                }
            }
        }
    });
};

/**
 * Xóa item khỏi wishlist
 * @param {string} userId 
 * @param {string} itemId 
 */
const removeFromWishlist = async (userId, itemId) => {
    const wishlistItem = await prisma.wishlist.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    if (!wishlistItem) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy trong danh sách yêu thích');
    }

    await prisma.wishlist.delete({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    return { message: 'Đã xóa khỏi danh sách yêu thích' };
};

/**
 * Kiểm tra item có trong wishlist không
 * @param {string} userId 
 * @param {string} itemId 
 */
const checkInWishlist = async (userId, itemId) => {
    const exists = await prisma.wishlist.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    return { inWishlist: !!exists };
};

/**
 * Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
 * @param {string} userId 
 * @param {string} itemId 
 */
const toggleWishlist = async (userId, itemId) => {
    const existing = await prisma.wishlist.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    if (existing) {
        await prisma.wishlist.delete({
            where: { userId_itemId: { userId, itemId } }
        });
        return { action: 'removed', inWishlist: false };
    } else {
        // Kiểm tra item tồn tại
        const item = await prisma.item.findUnique({
            where: { id: itemId }
        });

        if (!item) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy vật phẩm');
        }

        await prisma.wishlist.create({
            data: { userId, itemId }
        });
        return { action: 'added', inWishlist: true };
    }
};

export const wishlistService = {
    getMyWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    toggleWishlist,
};
