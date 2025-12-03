// server/controllers/order.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { orderService } from '../service/order.service.js';
import ApiError from '../utils/ApiError.js';

// (Dành cho Customer)
const createOrder = asyncHandler(async (req, res) => {
  // Lấy userId từ middleware 'protect'
  const userId = req.user.id;
  const order = await orderService.createOrder(userId, req.body);
  res.status(httpStatus.CREATED).send(order);
});

// (Dành cho Customer)
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await orderService.getMyOrders(userId);
  res.status(httpStatus.OK).send(orders);
});

// (Dành cho Customer)
const getMyOrderById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: orderId } = req.params;
  const order = await orderService.getMyOrderById(orderId, userId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  res.status(httpStatus.OK).send(order);
});

// (Dành cho Admin)
const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrdersAdmin();
  res.status(httpStatus.OK).send(orders);
});

// (Dành cho Admin)
const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const order = await orderService.getOrderByIdAdmin(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  res.status(httpStatus.OK).send(order);
});

const updateOrderAdmin = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const adminUserId = req.user.id; // Lấy ID của Admin/Staff từ middleware 'protect'

  const order = await orderService.updateOrderAdmin(
    orderId,
    req.body,
    adminUserId
  );

  res.status(httpStatus.OK).send(order);
});

export const orderController = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderAdmin,
};