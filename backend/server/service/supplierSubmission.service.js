// File: backend/server/service/supplierSubmission.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { Prisma, Decimal } from '@prisma/client';

/**
 * Tạo phiếu nhập hàng (do Supplier thực hiện)
 * @param {string} supplierUserId - ID của user có role SUPPLIER
 * @param {object} submissionData - Dữ liệu phiếu
 * @returns {Promise<SupplierSubmission>}
 */
const createSubmission = async (supplierUserId, submissionData) => {
  const { details, supplierNotes } = submissionData;

  // 1. Kiểm tra xem supplierUserId có đúng là Supplier không
  const supplier = await prisma.user.findFirst({
    where: { id: supplierUserId, role: 'SUPPLIER' },
  });
  if (!supplier) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User không có quyền Supplier');
  }

  // 2. Kiểm tra các Item ID
  const itemIds = details.map((d) => d.itemId);
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds } },
    select: { id: true },
  });
  if (items.length !== itemIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Một hoặc nhiều Item ID không tồn tại');
  }
  
  // 3. Tính tổng giá trị (tạm tính)
  let totalValue = new Decimal(0);
  for (const detail of details) {
    totalValue = totalValue.add(
      new Decimal(detail.suggestedPricePerUnitCoin).times(detail.quantity)
    );
  }

  // 4. Tạo phiếu trong 1 transaction
  const submission = await prisma.supplierSubmission.create({
    data: {
      supplierUserId: supplierUserId,
      supplierNotes: supplierNotes,
      totalValueCoin: totalValue,
      status: 'PENDING',
      supplierSubmissionDetails: {
        createMany: {
          data: details.map((d) => ({
            itemId: d.itemId,
            quantity: d.quantity,
            unit: d.unit,
            suggestedPricePerUnitCoin: d.suggestedPricePerUnitCoin,
            finalPricePerUnitCoin: 0, // Admin sẽ duyệt sau
          })),
        },
      },
    },
    include: {
      supplierSubmissionDetails: true,
    },
  });

  return submission;
};

/**
 * Duyệt phiếu nhập hàng (do Admin/Staff thực hiện)
 * Cập nhật kho và ghi log.
 * @param {string} submissionId - ID của phiếu
 * @param {string} adminUserId - ID của admin
 * @param {object} approvalData - Dữ liệu duyệt (notes, finalPrices)
 * @returns {Promise<SupplierSubmission>}
 */
const approveSubmission = async (submissionId, adminUserId, approvalData) => {
  const { adminNotes, finalPrices } = approvalData;

  return prisma.$transaction(async (tx) => {
    // 1. Lấy phiếu và chi tiết
    const submission = await tx.supplierSubmission.findUnique({
      where: { id: submissionId },
      include: {
        supplierSubmissionDetails: true,
      },
    });

    // 2. Kiểm tra
    if (!submission) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy phiếu nhập');
    }
    if (submission.status !== 'PENDING') {
      throw new ApiError(httpStatus.BAD_REQUEST, `Không thể duyệt phiếu ở trạng thái ${submission.status}`);
    }
    if (submission.supplierSubmissionDetails.length !== finalPrices.length) {
       throw new ApiError(httpStatus.BAD_REQUEST, 'Số lượng giá chốt không khớp với số lượng chi tiết phiếu');
    }
    
    let totalFinalValue = new Decimal(0);
    const detailUpdateOps = [];
    const inventoryLogOps = [];

    // 3. Duyệt qua từng chi tiết để cập nhật giá, kho, và chuẩn bị log
    for (const detail of submission.supplierSubmissionDetails) {
      const priceData = finalPrices.find((p) => p.detailId === detail.id);
      if (!priceData) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Thiếu giá chốt cho chi tiết ${detail.id}`);
      }

      const finalPrice = new Decimal(priceData.finalPricePerUnitCoin);
      totalFinalValue = totalFinalValue.add(finalPrice.times(detail.quantity));

      // 3.1. Chuẩn bị cập nhật `SupplierSubmissionDetail`
      detailUpdateOps.push(
        tx.supplierSubmissionDetail.update({
          where: { id: detail.id },
          data: { finalPricePerUnitCoin: finalPrice },
        })
      );

      // 3.2. Cập nhật `Item.stockQuantity` (lấy stock mới)
      const updatedItem = await tx.item.update({
        where: { id: detail.itemId },
        data: {
          stockQuantity: {
            increment: detail.quantity,
          },
        },
        select: { stockQuantity: true }, // Lấy số lượng tồn kho mới nhất
      });

      // 3.3. Chuẩn bị tạo `InventoryLog`
      inventoryLogOps.push(
        tx.inventoryLog.create({
          data: {
            itemId: detail.itemId,
            userId: adminUserId, // Admin là người duyệt
            quantityChange: detail.quantity, // (Số dương)
            newStockQuantity: updatedItem.stockQuantity,
            reason: 'SUPPLIER_SUBMISSION_APPROVED',
            notes: `Nhập từ phiếu ${submission.id}`,
          },
        })
      );
    }
    
    // 4. Thực thi
    await Promise.all(detailUpdateOps);
    await Promise.all(inventoryLogOps);

    // 5. Cập nhật phiếu nhập hàng chính
    const updatedSubmission = await tx.supplierSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        approvedByUserId: adminUserId,
        adminNotes: adminNotes,
        totalValueCoin: totalFinalValue,
      },
    });

    return updatedSubmission;
  });
};

/**
 * Từ chối phiếu nhập hàng
 * @param {string} submissionId
 * @param {string} adminUserId
 * @param {string} adminNotes
 * @returns {Promise<SupplierSubmission>}
 */
const rejectSubmission = async (submissionId, adminUserId, adminNotes) => {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy phiếu nhập');
  }
  if (submission.status !== 'PENDING') {
    throw new ApiError(httpStatus.BAD_REQUEST, `Không thể từ chối phiếu ở trạng thái ${submission.status}`);
  }

  return prisma.supplierSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'REJECTED',
      approvedByUserId: adminUserId,
      adminNotes: adminNotes,
    },
  });
};

/**
 * Lấy danh sách phiếu (cho Admin và Supplier)
 * @param {object} user - User đang đăng nhập
 * @param {object} filters - Bộ lọc (status)
 * @returns {Promise<SupplierSubmission[]>}
 */
const getSubmissions = async (user, filters) => {
  const where = {
    status: filters.status, // Sẽ undefined nếu không có filter
  };

  // Supplier chỉ thấy phiếu của mình
  if (user.role === 'SUPPLIER') {
    where.supplierUserId = user.id;
  }
  // Admin/Staff thấy tất cả
  
  return prisma.supplierSubmission.findMany({
    where,
    include: {
      supplier: { select: { inGameName: true, id: true } },
      approvedBy: { select: { inGameName: true, id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Lấy chi tiết 1 phiếu
 * @param {string} submissionId
 * @param {object} user - User đang đăng nhập
 * @returns {Promise<SupplierSubmission>}
 */
const getSubmissionById = async (submissionId, user) => {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
    include: {
      supplier: { select: { inGameName: true, id: true } },
      approvedBy: { select: { inGameName: true, id: true } },
      supplierSubmissionDetails: {
        include: {
          item: { select: { name: true, image: true, unit: true } },
        },
      },
    },
  });

  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy phiếu');
  }

  // Supplier chỉ thấy phiếu của mình
  if (user.role === 'SUPPLIER' && submission.supplierUserId !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Không có quyền xem phiếu này');
  }

  return submission;
};

export const supplierSubmissionService = {
  createSubmission,
  approveSubmission,
  rejectSubmission,
  getSubmissions,
  getSubmissionById,
};