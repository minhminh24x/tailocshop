// File: backend/server/controllers/stats.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { statsService } from '../service/stats.service.js';

/**
 * Lấy thống kê tổng quan Dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await statsService.getDashboardStats();
    res.status(httpStatus.OK).send(stats);
});

/**
 * Lấy đơn hàng gần đây
 */
const getRecentOrders = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const orders = await statsService.getRecentOrders(limit);
    res.status(httpStatus.OK).send(orders);
});

/**
 * Lấy sản phẩm sắp hết hàng
 */
const getLowStockItems = asyncHandler(async (req, res) => {
    const threshold = parseInt(req.query.threshold) || 10;
    const limit = parseInt(req.query.limit) || 10;
    const items = await statsService.getLowStockItems(threshold, limit);
    res.status(httpStatus.OK).send(items);
});

/**
 * [THÊM] Lấy thống kê public cho About page (không cần auth)
 */
const getPublicStats = asyncHandler(async (req, res) => {
    const stats = await statsService.getPublicStats();
    res.status(httpStatus.OK).send(stats);
});

/**
 * [MỚI] Lấy thống kê cho Staff Dashboard
 */
const getStaffSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const stats = await statsService.getStaffSummary(userId);
    res.status(httpStatus.OK).send(stats);
});

/**
 * [MỚI] Lấy thống kê cho Supplier Dashboard
 */
const getSupplierSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const stats = await statsService.getSupplierSummary(userId);
    res.status(httpStatus.OK).send(stats);
});

export const statsController = {
    getDashboardStats,
    getRecentOrders,
    getLowStockItems,
    getPublicStats,
    getStaffSummary,
    getSupplierSummary,
};
