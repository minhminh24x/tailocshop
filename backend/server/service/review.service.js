// File: backend/server/service/review.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Lấy reviews của một item (chỉ reviews đã duyệt)
 * @param {string} itemId 
 * @param {object} query - { page, limit }
 */
const getItemReviews = async (itemId, query = {}) => {
    const { page = 1, limit = 10 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
        itemId,
        isApproved: true
    };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        inGameName: true,
                    }
                }
            }
        }),
        prisma.review.count({ where })
    ]);

    // Tính trung bình rating
    const avgRating = await prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: true
    });

    return {
        data: reviews,
        stats: {
            averageRating: avgRating._avg.rating || 0,
            totalReviews: avgRating._count
        },
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / take)
        }
    };
};

/**
 * Tạo review mới
 * @param {string} userId 
 * @param {object} reviewData - { itemId, rating, comment }
 */
const createReview = async (userId, reviewData) => {
    const { itemId, rating, comment } = reviewData;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Rating phải từ 1 đến 5');
    }

    // Kiểm tra item tồn tại
    const item = await prisma.item.findUnique({
        where: { id: itemId }
    });

    if (!item) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy vật phẩm');
    }

    // Kiểm tra user đã review chưa
    const existingReview = await prisma.review.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    if (existingReview) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Bạn đã đánh giá sản phẩm này rồi');
    }

    // Kiểm tra user đã từng mua sản phẩm này chưa (BẮT BUỘC)
    const hasPurchased = await prisma.orderDetail.findFirst({
        where: {
            itemId,
            order: {
                customerUserId: userId,
                status: 'COMPLETED'
            }
        }
    });

    // [SỬA] Chỉ cho phép đánh giá nếu đã mua
    if (!hasPurchased) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn cần mua sản phẩm này trước khi đánh giá');
    }

    // Tạo review (auto-approve vì đã xác nhận mua)
    return prisma.review.create({
        data: {
            userId,
            itemId,
            rating,
            comment,
            isApproved: true // Tự duyệt vì đã xác nhận user đã mua
        },
        include: {
            user: {
                select: {
                    inGameName: true
                }
            },
            item: {
                select: {
                    name: true
                }
            }
        }
    });
};

/**
 * Cập nhật review của mình
 * @param {string} userId 
 * @param {string} reviewId 
 * @param {object} updateData - { rating, comment }
 */
const updateMyReview = async (userId, reviewId, updateData) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
    }

    if (review.userId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền sửa đánh giá này');
    }

    const { rating, comment } = updateData;

    if (rating && (rating < 1 || rating > 5)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Rating phải từ 1 đến 5');
    }

    return prisma.review.update({
        where: { id: reviewId },
        data: {
            ...(rating && { rating }),
            ...(comment !== undefined && { comment }),
            isApproved: false // Cần duyệt lại sau khi sửa
        }
    });
};

/**
 * Xóa review của mình
 * @param {string} userId 
 * @param {string} reviewId 
 */
const deleteMyReview = async (userId, reviewId) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
    }

    if (review.userId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền xóa đánh giá này');
    }

    await prisma.review.delete({
        where: { id: reviewId }
    });

    return { message: 'Xóa đánh giá thành công' };
};

/**
 * [Admin] Lấy tất cả reviews (bao gồm chưa duyệt)
 * @param {object} query - { page, limit, isApproved }
 */
const getAllReviewsAdmin = async (query = {}) => {
    const { page = 1, limit = 20, isApproved } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isApproved !== undefined) {
        where.isApproved = isApproved === 'true';
    }

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                user: {
                    select: { inGameName: true, email: true }
                },
                item: {
                    select: { name: true, slug: true, allowedUnits: true, baseUnit: true }
                }
            }
        }),
        prisma.review.count({ where })
    ]);

    return {
        data: reviews,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / take)
        }
    };
};

/**
 * [Admin] Duyệt review
 * @param {string} reviewId 
 * @param {boolean} isApproved 
 */
const approveReview = async (reviewId, isApproved) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
    }

    return prisma.review.update({
        where: { id: reviewId },
        data: { isApproved }
    });
};

/**
 * [Admin] Xóa review
 * @param {string} reviewId 
 */
const deleteReviewAdmin = async (reviewId) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
    }

    await prisma.review.delete({
        where: { id: reviewId }
    });

    return { message: 'Xóa đánh giá thành công' };
};

export const reviewService = {
    getItemReviews,
    createReview,
    updateMyReview,
    deleteMyReview,
    getAllReviewsAdmin,
    approveReview,
    deleteReviewAdmin,
};
