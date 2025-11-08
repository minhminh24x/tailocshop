// File: frontend/src/pages/ItemDetailPage.js
// [CODE ĐÃ CẬP NHẬT LAYOUT VÀ LOGIC GIÁ]
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSingleItem } from '../services/itemService.js';
import { useCartStore } from '../store/cartStore.js';
import { formatNumber } from '../utils/formatNumber.js'; // <-- Đã import

export default function ItemDetailPage() {
  const { slug, unit } = useParams(); 
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const addItemToCart = useCartStore((state) => state.addItem);

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

  // Hàm xử lý thêm vào giỏ
  const handleAddToCart = () => {
    if (!item) return;
    
    let qtyToAdd = Number(quantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      qtyToAdd = 1;
    }
    
    addItemToCart(item, qtyToAdd);
  };
  
  // Hàm xử lý nhập số lượng
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

  // [SỬA] Thêm logic xử lý giá (giống ItemCard)
  const priceCoinNum = parseFloat(item.priceCoin) || 0;
  const priceUsdNum = parseFloat(item.priceUsd) || 0;
  const isCoinOnly = priceCoinNum > 0 && priceUsdNum <= 0;
  const isUsdOnly = priceUsdNum > 0 && priceCoinNum <= 0;
  const hasBothPrices = priceCoinNum > 0 && priceUsdNum > 0;

  return (
    // [SỬA] Thay đổi max-w-4xl thành max-w-7xl để rộng hơn
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-7xl mx-auto">
      <div className="md:flex">
        {/* Cột ảnh */}
        <div className="md:w-1/2">
          <img src={imageUrl} alt={item.name} className="w-full h-64 md:h-full object-cover" />
        </div>
        
        {/* Cột thông tin */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <h1 className="text-4xl font-bold text-white mb-2">{item.name}</h1>
          <span className="text-sm bg-pink-600 text-white px-3 py-1 rounded-full font-semibold self-start">
            Đơn vị: {item.unit}
          </span>
          
          {item.category && (
             <p className="text-gray-400 text-md mt-4">Phân loại: {item.category.name}</p>
          )}

          <p className="text-gray-300 mt-4 text-lg">
            {item.description || "Vật phẩm này chưa có mô tả."}
          </p>

          {/* [SỬA] Logic hiển thị giá mới */}
          <div className="my-6">
            {/* TRƯỜNG HỢP 1: CHỈ BÁN BẰNG XU */}
            {isCoinOnly && (
              <>
                <span className="inline-block bg-yellow-600 text-yellow-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                  Chỉ Được Bán Bằng Xu
                </span>
                <span className="block text-4xl font-bold text-yellow-400">
                  {formatNumber(priceCoinNum)} Xu
                </span>
              </>
            )}

            {/* TRƯỜNG HỢP 2: CHỈ BÁN BẰNG USD */}
            {isUsdOnly && (
              <>
                <span className="inline-block bg-green-600 text-green-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                  Có thể mua bằng USD
                </span>
                <span className="block text-4xl font-bold text-green-400">
                  ${formatNumber(priceUsdNum)}
                </span>
              </>
            )}

            {/* TRƯỜNG HỢP 3: CÓ CẢ 2 GIÁ */}
            {hasBothPrices && (
              <>
                <span className="block text-4xl font-bold text-green-400">
                  ${formatNumber(priceUsdNum)}
                </span>
                <span className="block text-3xl font-bold text-yellow-400">
                  {formatNumber(priceCoinNum)} Xu
                </span>
              </>
            )}
          </div>

          <p className="text-lg text-yellow-400 mb-4">
            {/* [SỬA] Chuẩn hóa số lượng tồn kho */}
            Số lượng tồn kho: {formatNumber(item.stockQuantity)}
          </p>

          {/* Khu vực thêm vào giỏ hàng (Giữ nguyên logic) */}
          <div className="mt-auto"> {/* Đẩy xuống dưới cùng */}
            {item.stockQuantity > 0 ? (
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={item.stockQuantity}
                  className="w-24 px-3 py-3 bg-gray-700 border border-gray-600 rounded text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
          </div>
          
        </div>
      </div>
    </div>
  );
}