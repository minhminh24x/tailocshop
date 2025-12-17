// File: backend/server/service/orderReview.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Tạo đánh giá cho đơn hàng
 * @param {string} userId - ID người dùng
 * @param {string} orderId - ID đơn hàng
 * @param {object} reviewData - Dữ liệu đánh giá
 */
const createReview = async (userId, orderId, reviewData) => {
    const { productRating, serviceRating, staffRating, comment } = reviewData;

    // Validate ratings (1-5)
    for (const [name, rating] of Object.entries({ productRating, serviceRating, staffRating })) {
        if (!rating || rating < 1 || rating > 5) {
            throw new ApiError(httpStatus.BAD_REQUEST, `${name} phải từ 1-5`);
        }
    }

    // Kiểm tra đơn hàng tồn tại và thuộc về user này
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            customerUserId: true,
            status: true,
            review: true
        }
    });

    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Đơn hàng không tồn tại');
    }

    if (order.customerUserId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền đánh giá đơn hàng này');
    }

    if (order.status !== 'COMPLETED') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Chỉ đánh giá được đơn hàng đã hoàn thành');
    }

    if (order.review) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Đơn hàng này đã được đánh giá');
    }

    // Tạo đánh giá
    const review = await prisma.orderReview.create({
        data: {
            orderId,
            userId,
            productRating: parseInt(productRating),
            serviceRating: parseInt(serviceRating),
            staffRating: parseInt(staffRating),
            comment: comment || null,
        },
        include: {
            order: {
                select: { orderNumber: true }
            },
            user: {
                select: { inGameName: true }
            }
        }
    });

    return review;
};

/**
 * Lấy đánh giá của một đơn hàng
 */
const getReviewByOrderId = async (orderId) => {
    const review = await prisma.orderReview.findUnique({
        where: { orderId },
        include: {
            user: {
                select: { inGameName: true }
            },
            order: {
                select: {
                    orderNumber: true,
                    staff: {
                        select: { inGameName: true }
                    }
                }
            }
        }
    });

    return review;
};

/**
 * Lấy tất cả đánh giá (Admin)
 */
const getAllReviews = async (options = {}) => {
    const { page = 1, limit = 20, staffId } = options;
    const skip = (page - 1) * limit;

    const where = {};
    if (staffId) {
        where.order = { staffUserId: staffId };
    }

    const [reviews, total] = await Promise.all([
        prisma.orderReview.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, inGameName: true }
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        staffUserId: true,
                        staff: {
                            select: { inGameName: true }
                        }
                    }
                }
            }
        }),
        prisma.orderReview.count({ where })
    ]);

    return {
        data: reviews,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Lấy thống kê đánh giá (Admin/Staff)
 */
const getReviewStats = async (staffId = null) => {
    const where = staffId ? { order: { staffUserId: staffId } } : {};

    const stats = await prisma.orderReview.aggregate({
        where,
        _avg: {
            productRating: true,
            serviceRating: true,
            staffRating: true,
        },
        _count: true,
    });

    // Đếm số đánh giá theo từng số sao cho staffRating
    const ratingDistribution = await prisma.orderReview.groupBy({
        by: ['staffRating'],
        where,
        _count: true,
    });

    return {
        totalReviews: stats._count,
        averages: {
            product: stats._avg.productRating ? parseFloat(stats._avg.productRating.toFixed(1)) : 0,
            service: stats._avg.serviceRating ? parseFloat(stats._avg.serviceRating.toFixed(1)) : 0,
            staff: stats._avg.staffRating ? parseFloat(stats._avg.staffRating.toFixed(1)) : 0,
        },
        ratingDistribution: ratingDistribution.reduce((acc, r) => {
            acc[r.staffRating] = r._count;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    };
};

export const orderReviewService = {
    createReview,
    getReviewByOrderId,
    getAllReviews,
    getReviewStats,
};
