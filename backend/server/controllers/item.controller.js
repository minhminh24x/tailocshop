// server/controllers/item.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { itemService } from '../service/item.service.js';
import ApiError from '../utils/ApiError.js';

const createItem = asyncHandler(async (req, res) => {
  const item = await itemService.createItem(req.body);
  res.status(httpStatus.CREATED).send(item);
});

const getAllItems = asyncHandler(async (req, res) => {
  const result = await itemService.getAllItems(req.query);
  res.status(httpStatus.OK).send(result);
});

const getAllItemsAdmin = asyncHandler(async (req, res) => {
  const items = await itemService.getAllItemsAdmin();
  res.status(httpStatus.OK).send(items);
});

const getItem = asyncHandler(async (req, res) => {
  const { slug, unit } = req.params;
  const item = await itemService.getItemBySlugAndUnit(slug, unit);

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy vật phẩm');
  }

  res.status(httpStatus.OK).json(item);
});

const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await itemService.updateItem(id, req.body);
  res.status(httpStatus.OK).json(item);
});

const getFeaturedItems = asyncHandler(async (req, res) => {
  const items = await itemService.getFeaturedItems();
  res.status(httpStatus.OK).send(items);
});

const deleteItem = asyncHandler(async (req, res) => {
  await itemService.deleteItem(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

export const itemController = {
  createItem,
  getAllItems,
  getAllItemsAdmin,
  getFeaturedItems,
  getItem,
  updateItem,
  deleteItem,
};