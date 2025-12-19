// File: frontend/src/utils/unitUtils.js
// Utility functions for Minecraft unit conversion system

/**
 * Hệ số chuyển đổi đơn vị (số PIECE trong mỗi đơn vị)
 */
export const UNIT_MULTIPLIER = {
    PIECE: 1,
    STACK: 64,
    SHULKER: 1728  // 64 * 27 = 1728
};

/**
 * Nhãn hiển thị cho mỗi đơn vị
 */
export const UNIT_LABELS = {
    PIECE: 'Piece',
    STACK: 'Stack (64)',
    SHULKER: 'Shulker (1728)'
};

/**
 * Nhãn ngắn cho mỗi đơn vị
 */
export const UNIT_SHORT_LABELS = {
    PIECE: 'pcs',
    STACK: 'stack',
    SHULKER: 'shulker'
};

/**
 * Chuyển đổi số lượng từ đơn vị này sang đơn vị khác
 * @param {number} quantity - Số lượng nguồn
 * @param {string} fromUnit - Đơn vị nguồn
 * @param {string} toUnit - Đơn vị đích
 * @returns {number} - Số lượng đích (làm tròn xuống)
 */
export const convertUnits = (quantity, fromUnit, toUnit) => {
    const pieces = quantity * (UNIT_MULTIPLIER[fromUnit] || 1);
    return Math.floor(pieces / (UNIT_MULTIPLIER[toUnit] || 1));
};

/**
 * Lấy breakdown của một số lượng PIECE thành các đơn vị lớn hơn
 * @param {number} pieces - Số lượng PIECE
 * @returns {object} - { pieces, stacks, shulkers }
 */
export const getUnitBreakdown = (pieces) => {
    return {
        pieces: pieces,
        stacks: Math.floor(pieces / UNIT_MULTIPLIER.STACK),
        shulkers: Math.floor(pieces / UNIT_MULTIPLIER.SHULKER)
    };
};

/**
 * Format hiển thị breakdown
 * @param {number} pieces - Số PIECE
 * @returns {string} - Ví dụ: "6000 pcs = 93 stack = 3 shulker"
 */
export const formatBreakdown = (pieces) => {
    const breakdown = getUnitBreakdown(pieces);
    return `${breakdown.pieces.toLocaleString()} pcs = ${breakdown.stacks} stack = ${breakdown.shulkers} shulker`;
};

/**
 * Tính giá dựa trên basePrice và unit
 * @param {number} basePrice - Giá cơ sở
 * @param {string} baseUnit - Đơn vị cơ sở
 * @param {string} targetUnit - Đơn vị đích
 * @returns {number} - Giá theo đơn vị đích
 */
export const calculatePriceForUnit = (basePrice, baseUnit, targetUnit) => {
    if (!basePrice || basePrice <= 0) return 0;

    const baseMultiplier = UNIT_MULTIPLIER[baseUnit] || 1;
    const targetMultiplier = UNIT_MULTIPLIER[targetUnit] || 1;
    const ratio = targetMultiplier / baseMultiplier;

    return Math.round(basePrice * ratio * 100) / 100;
};

/**
 * Tính stock theo đơn vị
 * @param {number} stockQuantity - Stock (luôn là PIECE)
 * @param {string} unit - Đơn vị muốn hiển thị
 * @returns {number} - Stock theo đơn vị
 */
export const getStockInUnit = (stockQuantity, unit) => {
    return Math.floor(stockQuantity / (UNIT_MULTIPLIER[unit] || 1));
};
