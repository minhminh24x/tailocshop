// File: frontend/src/pages/CartPage.js
// [CODE ĐÃ VIẾT LẠI HOÀN TOÀN - SỬA LỖI VÀ THÊM TÍNH NĂNG]
import React, { useState, useMemo } from 'react';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { Link, useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/cart/LoginPromptModal.js';
import { formatNumber } from '../utils/formatNumber.js';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa'; // Import icons

export default function CartPage() {
  // [FIX 1] Dùng đúng tên hàm "updateItemQuantity" từ file của bạn
  const { items, updateItemQuantity, removeItem, totalItems } = useCartStore();
  const { user, vipLevel } = useAuthStore();
  
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // [FIX 2] Thêm lại logic tính toán VIP (giống trang Checkout)
  const { subtotal, discountPercent, discountAmount, totalAmount } = useMemo(() => {
    // Tạm tính luôn được tính bằng Xu
    const subtotal = items.reduce((acc, entry) => {
      const price = parseFloat(entry.itemData.priceCoin || 0);
      return acc + price * entry.quantity;
    }, 0);
    
    const discountPercent = vipLevel?.discountPercent || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAmount = subtotal - discountAmount;
    return { subtotal, discountPercent, discountAmount, totalAmount };
  }, [items, vipLevel]);

  // Xử lý nút "Đặt Hàng"
  const handleCheckout = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/checkout'); 
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-white mb-4">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-400 mb-8">Hãy thêm vài vật phẩm nào!</p>
        <Link to="/items" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-pink-500">Giỏ hàng của bạn</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột 1: Danh sách vật phẩm (Layout mới) */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Chi tiết ({totalItems} vật phẩm)</h2>

          {/* === TIÊU ĐỀ BẢNG (Layout mới) === */}
          <div className="hidden md:grid grid-cols-6 gap-4 mb-4 pb-2 border-b border-gray-700 text-gray-400 font-semibold">
            <div className="col-span-3">Vật Phẩm</div>
            <div className="text-left">Giá Tiền</div>
            <div className="text-center">Số Lượng</div>
            <div className="text-right">Thành Tiền</div>
          </div>
          {/* === KẾT THÚC TIÊU ĐỀ === */}

          <div className="space-y-4">
            {items.map(({ itemData, quantity }) => {
              const priceCoinNum = parseFloat(itemData.priceCoin) || 0;
              const priceUsdNum = parseFloat(itemData.priceUsd) || 0;
              
              // [FIX 3] Tính cả 2 loại thành tiền
              const lineTotalXu = priceCoinNum * quantity;
              const lineTotalUsd = priceUsdNum * quantity;
              
              return (
                <div key={itemData.id} className="grid grid-cols-6 gap-4 items-center p-4 bg-gray-700 rounded-lg">
                  
                  {/* Cột 1: Vật Phẩm (Hình, Tên, Đơn vị) */}
                  <div className="col-span-6 md:col-span-3 flex items-center space-x-4">
                    <img 
                      src={itemData.thumbnailImageUrl || 'https://placehold.co/100x100/2D3748/FFFFFF?text=Item'} 
                      alt={itemData.name} 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold text-white">{itemData.name}</p>
                      <p className="text-sm text-gray-400">Đơn vị: {itemData.unit}</p>
                    </div>
                  </div>
                  
                  {/* Cột 2: Giá Tiền (USD và Xu) */}
                  <div className="col-span-3 md:col-span-1 text-left">
                    {priceUsdNum > 0 && (
                      <p className="text-md font-semibold text-green-400">
                        ${formatNumber(priceUsdNum)}
                      </p>
                    )}
                    {priceCoinNum > 0 && (
                      <p className="text-md font-semibold text-yellow-400">
                        {formatNumber(priceCoinNum)} Xu
                      </p>
                    )}
                  </div>
                  
                  {/* Cột 3: Số Lượng (Input) */}
                  <div className="col-span-3 md:col-span-1 flex justify-center items-center border border-gray-600 rounded-lg">
                    {/* [FIX 1] Gọi đúng hàm "updateItemQuantity" */}
                    <button 
                      onClick={() => updateItemQuantity(itemData.id, quantity - 1)}
                      className="p-2 text-white disabled:text-gray-500"
                      disabled={quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    
                    {/* [FIX 1] Đổi input (gây lỗi) sang text */}
                    <span className="px-3 text-lg font-bold">{quantity}</span>
                    
                    {/* [FIX 1] Gọi đúng hàm "updateItemQuantity" */}
                    <button 
                      onClick={() => updateItemQuantity(itemData.id, quantity + 1)}
                      className="p-2 text-white disabled:text-gray-500"
                      // [FIX 2] Thêm logic kiểm tra tồn kho
                      disabled={quantity >= itemData.stockQuantity}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  {/* Cột 4: Thành Tiền */}
                  <div className="col-span-6 md:col-span-1 text-right">
                    {/* [FIX 3] Hiển thị cả 2 thành tiền */}
                    {lineTotalUsd > 0 && (
                      <p className="text-md font-semibold text-green-400">
                        ${formatNumber(lineTotalUsd)}
                      </p>
                    )}
                    {lineTotalXu > 0 && (
                      <p className="text-lg font-semibold text-yellow-400">
                        {formatNumber(lineTotalXu)} Xu
                      </p>
                    )}
                    <button 
                      onClick={() => removeItem(itemData.id)} 
                      className="text-red-500 hover:text-red-400 mt-1"
                      title="Xóa vật phẩm"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Cột 2: Tóm tắt đơn hàng (Đã chuẩn hóa) */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-2xl font-semibold mb-6">Tóm tắt</h2>
          <div className="space-y-3 border-b border-gray-700 pb-4 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Tạm tính (Xu):</span>
              <span className="text-white">{formatNumber(subtotal)} Xu</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Giảm giá VIP ({discountPercent}%):</span>
              <span className="text-pink-400">-{formatNumber(discountAmount)} Xu</span>
            </div>
          </div>
          <div className="flex justify-between text-2xl font-bold">
            <span className="text-white">Tổng cộng (Xu):</span>
            <span className="text-green-400">{formatNumber(totalAmount)} Xu</span>
          </div>
          
          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            {user ? 'Tiến hành Thanh toán' : 'Đăng nhập để Thanh toán'}
          </button>
        </div>
        
      </div>

      {/* Modal Yêu cầu Đăng nhập */}
      <LoginPromptModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}