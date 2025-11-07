// File: frontend/src/pages/ItemDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSingleItem } from '../services/itemService.js';
import { useCartStore } from '../store/cartStore.js'; // <-- 1. IMPORT CART STORE

export default function ItemDetailPage() {
  const { slug, unit } = useParams(); 
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1); // <-- 2. STATE SỐ LƯỢNG
  const addItemToCart = useCartStore((state) => state.addItem); // <-- 3. LẤY HÀM TỪ STORE

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSingleItem(slug, unit);
        setItem(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tìm thấy vật phẩm');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug && unit) {
      fetchItem();
    }
  }, [slug, unit]);

  // --- 4. HÀM XỬ LÝ THÊM VÀO GIỎ ---
  const handleAddToCart = () => {
    if (!item) return;
    
    let qtyToAdd = Number(quantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      qtyToAdd = 1;
    }
    
    // Hàm addItem trong store sẽ tự xử lý logic và toast
    addItemToCart(item, qtyToAdd);
  };
  
  // --- 5. HÀM XỬ LÝ NHẬP SỐ LƯỢNG ---
  const handleQuantityChange = (e) => {
    let newQty = parseInt(e.target.value, 10);
    
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    if (item && newQty > item.stockQuantity) {
      newQty = item.stockQuantity;
    }
    setQuantity(newQty);
  };

  // (Phần render loading, error, !item giữ nguyên...)
  if (isLoading) {
    return <p className="text-center text-xl text-gray-400">Đang tải chi tiết...</p>;
  }
  if (error) {
    return <p className="text-center text-xl text-red-500">Lỗi: {error}</p>;
  }
  if (!item) {
    return <p className="text-center text-xl text-gray-400">Không có dữ liệu.</p>;
  }

  const imageUrl = item.thumbnailImageUrl || 'https://placehold.co/600x400/2D3748/FFFFFF?text=TaiLocShop';

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img src={imageUrl} alt={item.name} className="w-full h-64 md:h-full object-cover" />
        </div>
        
        <div className="md:w-1/2 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">{item.name}</h1>
          <span className="text-sm bg-pink-600 text-white px-3 py-1 rounded-full font-semibold">
            Đơn vị: {item.unit}
          </span>
          
          {item.category && (
             <p className="text-gray-400 text-md mt-4">Phân loại: {item.category.name}</p>
          )}

          <p className="text-gray-300 mt-4 text-lg">
            {item.description || "Vật phẩm này chưa có mô tả."}
          </p>

          <div className="my-6">
            <span className="text-4xl font-bold text-green-400">{item.priceCoin} Xu</span>
            {item.priceUsd && (
              <span className="text-xl text-gray-500 line-through ml-3">{item.priceUsd}$</span>
            )}
          </div>

          <p className="text-lg text-yellow-400 mb-4">
            Số lượng tồn kho: {item.stockQuantity}
          </p>

          {/* --- 6. KHU VỰC THÊM VÀO GIỎ HÀNG --- */}
          {item.stockQuantity > 0 ? (
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={item.stockQuantity}
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          ) : (
            <button 
              disabled
              className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg cursor-not-allowed"
            >
              Hết hàng
            </button>
          )}
          {/* --- KẾT THÚC KHU VỰC GIỎ HÀNG --- */}
          
        </div>
      </div>
    </div>
  );
}