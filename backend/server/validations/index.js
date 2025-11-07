// File: backend/server/validations/index.js

// 1. Import tất cả các file validation (file gốc của bạn bị thiếu 2 dòng)
import { orderValidation } from './order.validation.js';
import { itemValidation } from './item.validation.js'; // <-- File gốc bị thiếu
import { categoryValidation } from './category.validation.js';
import { deliveryTimeSlotValidation } from './deliveryTimeSlot.validation.js';
import { vipLevelValidation } from './vipLevel.validation.js'; // <-- File gốc bị thiếu

// 2. Export "gom lại" (authValidation) cho các file nào cần
//    (Tôi đã thêm itemValidation và vipLevelValidation vào đây)
export const authValidation = { 
  orderValidation,
  itemValidation, 
  categoryValidation,
  deliveryTimeSlotValidation,
  vipLevelValidation, 
};

// 3. Export "riêng lẻ" (custom) để sửa lỗi ngay lập tức của bạn
//    Phần này sẽ export 'itemValidation' trực tiếp
export { 
  orderValidation,
  itemValidation,
  categoryValidation,
  deliveryTimeSlotValidation,
  vipLevelValidation
};