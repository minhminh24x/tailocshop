// File: backend/server/controllers/export.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { exportService } from '../service/export.service.js';

/**
 * Export Orders to CSV
 */
const exportOrders = asyncHandler(async (req, res) => {
    const { status, paymentStatus, fromDate, toDate } = req.query;

    const result = await exportService.exportOrdersCSV({
        status,
        paymentStatus,
        fromDate,
        toDate
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.status(httpStatus.OK).send(result.csv);
});

/**
 * Export Inventory to CSV
 */
const exportInventory = asyncHandler(async (req, res) => {
    const { categoryId, lowStockOnly, threshold } = req.query;

    const result = await exportService.exportInventoryCSV({
        categoryId,
        lowStockOnly,
        threshold
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.status(httpStatus.OK).send(result.csv);
});

/**
 * Export Customers to CSV
 */
const exportCustomers = asyncHandler(async (req, res) => {
    const result = await exportService.exportCustomersCSV();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.status(httpStatus.OK).send(result.csv);
});

export const exportController = {
    exportOrders,
    exportInventory,
    exportCustomers
};
