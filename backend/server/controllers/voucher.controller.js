// File: backend/server/controllers/voucher.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { voucherService } from '../service/voucher.service.js';

// ========== Admin Endpoints ==========

/**
 * [Admin] Lấy tất cả vouchers
 */
const getAllVouchers = asyncHandler(async (req, res) => {
    const result = await voucherService.getAllVouchers(req.query);
    res.status(httpStatus.OK).send(result);
});

/**
 * [Admin] Lấy chi tiết voucher
 */
const getVoucherById = asyncHandler(async (req, res) => {
    const { voucherId } = req.params;
    const voucher = await voucherService.getVoucherById(voucherId);
    res.status(httpStatus.OK).send(voucher);
});

/**
 * [Admin] Tạo voucher mới
 */
const createVoucher = asyncHandler(async (req, res) => {
    const voucher = await voucherService.createVoucher(req.body);
    res.status(httpStatus.CREATED).send(voucher);
});

/**
 * [Admin] Cập nhật voucher
 */
const updateVoucher = asyncHandler(async (req, res) => {
    const { voucherId } = req.params;
    const voucher = await voucherService.updateVoucher(voucherId, req.body);
    res.status(httpStatus.OK).send(voucher);
});

/**
 * [Admin] Xóa voucher
 */
const deleteVoucher = asyncHandler(async (req, res) => {
    const { voucherId } = req.params;
    const result = await voucherService.deleteVoucher(voucherId);
    res.status(httpStatus.OK).send(result);
});

// ========== Customer Endpoints ==========

/**
 * [Customer] Kiểm tra và validate voucher
 */
const validateVoucher = asyncHandler(async (req, res) => {
    const { code, orderTotal } = req.body;

    if (!code) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Mã giảm giá là bắt buộc'
        });
    }

    if (!orderTotal || orderTotal <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Tổng tiền đơn hàng không hợp lệ'
        });
    }

    const result = await voucherService.validateVoucher(code, orderTotal);
    res.status(httpStatus.OK).send(result);
});

export const voucherController = {
    getAllVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
};
