// File: backend/server/service/application.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Submit a new application
 * @param {object} applicationData - { type, email, inGameName, discord, formData }
 * @returns {Promise<Application>}
 */
const submitApplication = async (applicationData) => {
    const { type, email, inGameName, discord, formData } = applicationData;

    // Check if already has pending application of same type
    const existing = await prisma.application.findFirst({
        where: {
            email,
            type,
            status: 'PENDING',
        },
    });

    if (existing) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Bạn đã có đơn đăng ký đang chờ duyệt. Vui lòng đợi phản hồi.'
        );
    }

    const application = await prisma.application.create({
        data: {
            type,
            email,
            inGameName,
            discord,
            formData: formData || {},
        },
    });

    return application;
};

/**
 * Get all applications (for Admin)
 * @param {object} query - { page, limit, type, status }
 * @returns {Promise<{data: Application[], pagination: object}>}
 */
const getApplications = async (query = {}) => {
    const { page = 1, limit = 20, type, status } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const total = await prisma.application.count({ where: whereClause });
    const applications = await prisma.application.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    });

    return {
        data: applications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / take),
        },
    };
};

/**
 * Get application by ID (for Admin)
 * @param {string} id
 * @returns {Promise<Application>}
 */
const getApplicationById = async (id) => {
    const application = await prisma.application.findUnique({
        where: { id },
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn đăng ký');
    }

    return application;
};

/**
 * Update application status (Approve/Reject)
 * @param {string} id
 * @param {object} updateData - { status, rejectReason }
 * @param {string} adminUserId
 * @returns {Promise<Application>}
 */
const updateApplicationStatus = async (id, updateData, adminUserId) => {
    const { status, rejectReason } = updateData;

    const application = await prisma.application.findUnique({
        where: { id },
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn đăng ký');
    }

    if (application.status !== 'PENDING') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Đơn đăng ký đã được xử lý');
    }

    const updated = await prisma.application.update({
        where: { id },
        data: {
            status,
            rejectReason: status === 'REJECTED' ? rejectReason : null,
            reviewedBy: adminUserId,
            reviewedAt: new Date(),
        },
    });

    return updated;
};

export const applicationService = {
    submitApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
};
