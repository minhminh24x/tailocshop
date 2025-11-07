// File: frontend/src/pages/CartPage.js
import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { Link, useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/cart/LoginPromptModal.js'; // (File tiếp theo)

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const user = useAuthStore((state) => state.user);
  
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Tính tổng
  const subTotal = items.reduce((acc, entry) => {
    // Ưu tiên giá Coin
    const price = parseFloat(entry.itemData.priceCoin || entry.itemData.priceUsd || 0);
    return acc + price * entry.quantity;
  }, 0);

  // Xử lý nút "Đặt Hàng" (Req 3)
  const handleCheckout = () => {
    if (!user) {
      // Khách: Mở Modal yêu cầu đăng nhập
      setIsLoginModalOpen(true);
    } else {
      // User đã đăng nhập: Chuyển đến trang thanh toán
      // (Chúng ta sẽ tạo trang /checkout ở bước sau)
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Giỏ Hàng</h1>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        {/* Danh sách vật phẩm */}
        <div className="space-y-4">
          {items.map(({ itemData, quantity }) => (
            <div key={itemData.id} className="flex items-center justify-between border-b border-gray-700 pb-4">
              <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => updateItemQuantity(itemData.id, parseInt(e.target.value, 10))}
                  min="1"
                  max={itemData.stockQuantity}
                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                />
                <button 
                  onClick={() => removeItem(itemData.id)} 
                  className="text-red-400 hover:text-red-300"
                  title="Xóa vật phẩm"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng kết và Đặt hàng */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Tổng cộng: <span className="text-green-400">{subTotal.toFixed(2)} Xu</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full md:w-auto mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Tiến hành Đặt hàng
          </button>
        </div>
      </div>

      {/* Modal Yêu cầu Đăng nhập (Req 3) */}
      <LoginPromptModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}