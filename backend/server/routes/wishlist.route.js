// File: backend/server/routes/wishlist.route.js
import express from 'express';
import { wishlistController } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

// GET /api/wishlist - Lấy danh sách yêu thích của tôi
router.get('/', wishlistController.getMyWishlist);

// POST /api/wishlist - Thêm vào yêu thích
router.post('/', wishlistController.addToWishlist);

// POST /api/wishlist/toggle - Toggle yêu thích
router.post('/toggle', wishlistController.toggleWishlist);

// GET /api/wishlist/check/:itemId - Kiểm tra item có trong wishlist không
router.get('/check/:itemId', wishlistController.checkInWishlist);

// DELETE /api/wishlist/:itemId - Xóa khỏi yêu thích
router.delete('/:itemId', wishlistController.removeFromWishlist);

export default router;
