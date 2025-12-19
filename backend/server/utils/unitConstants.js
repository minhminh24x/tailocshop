// File: backend/server/utils/unitConstants.js
// Hằng số cho hệ thống multi-unit Minecraft

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
 * Tính giá cho một đơn vị bất kỳ dựa trên giá baseUnit
 * @param {number} basePrice - Giá của baseUnit
 * @param {string} baseUnit - Đơn vị cơ sở (PIECE, STACK, SHULKER)
 * @param {string} targetUnit - Đơn vị muốn tính giá
 * @returns {number} - Giá của targetUnit
 */
export const calculatePriceForUnit = (basePrice, baseUnit, targetUnit) => {
    if (!basePrice || basePrice <= 0) return 0;

    const baseMultiplier = UNIT_MULTIPLIER[baseUnit] || 1;
    const targetMultiplier = UNIT_MULTIPLIER[targetUnit] || 1;
    const ratio = targetMultiplier / baseMultiplier;

    return Math.round(basePrice * ratio * 100) / 100; // Round to 2 decimal places
};

/**
 * Tính số lượng stock theo một đơn vị cụ thể
 * @param {number} stockQuantity - Số lượng stock (luôn là PIECE)
 * @param {string} unit - Đơn vị muốn hiển thị
 * @returns {number} - Số lượng theo đơn vị đó (làm tròn xuống)
 */
export const getStockInUnit = (stockQuantity, unit) => {
    const multiplier = UNIT_MULTIPLIER[unit] || 1;
    return Math.floor(stockQuantity / multiplier);
};

/**
 * Tính số PIECE cần trừ kho khi mua một số lượng của một đơn vị
 * @param {number} quantity - Số lượng mua
 * @param {string} unit - Đơn vị mua
 * @returns {number} - Số PIECE cần trừ
 */
export const calculateStockDeduction = (quantity, unit) => {
    const multiplier = UNIT_MULTIPLIER[unit] || 1;
    return quantity * multiplier;
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
 * Tính giá và stock cho tất cả unit được phép
 * @param {object} item - Item từ database
 * @returns {object} - { PIECE: { priceCoin, priceUsd, stock }, STACK: {...}, ... }
 */
export const calculateAllUnitPrices = (item) => {
    const { allowedUnits, baseUnit, basePriceCoin, basePriceUsd, stockQuantity } = item;

    const result = {};

    for (const unit of (allowedUnits || ['PIECE'])) {
        result[unit] = {
            priceCoin: calculatePriceForUnit(parseFloat(basePriceCoin) || 0, baseUnit, unit),
            priceUsd: calculatePriceForUnit(parseFloat(basePriceUsd) || 0, baseUnit, unit),
            stock: getStockInUnit(stockQuantity || 0, unit),
            multiplier: UNIT_MULTIPLIER[unit]
        };
    }

    return result;
};
