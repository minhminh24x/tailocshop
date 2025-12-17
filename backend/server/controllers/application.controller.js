// File: backend/server/controllers/application.controller.js
import { applicationService } from '../service/application.service.js';
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Submit application (Public - for registration pages)
 */
const submitApplication = asyncHandler(async (req, res) => {
    const application = await applicationService.submitApplication(req.body);
    res.status(httpStatus.CREATED).json({
        message: 'Đơn đăng ký đã được gửi thành công!',
        application,
    });
});

/**
 * Get all applications (Admin)
 */
const getApplications = asyncHandler(async (req, res) => {
    const result = await applicationService.getApplications(req.query);
    res.status(httpStatus.OK).json(result);
});

/**
 * Get application by ID (Admin)
 */
const getApplicationById = asyncHandler(async (req, res) => {
    const application = await applicationService.getApplicationById(req.params.id);
    res.status(httpStatus.OK).json(application);
});

/**
 * Update application status (Admin)
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const result = await applicationService.updateApplicationStatus(
        req.params.id,
        req.body,
        req.user.id
    );
    res.status(httpStatus.OK).json({
        message: result.status === 'APPROVED' ? 'Đã duyệt đơn đăng ký' : 'Đã từ chối đơn đăng ký',
        application: result,
    });
});

export const applicationController = {
    submitApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
};
