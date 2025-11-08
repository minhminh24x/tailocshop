// File: frontend/src/pages/ItemDetailPage.js
// [CODE ĐẦY ĐỦ]
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSingleItem } from '../services/itemService.js';
import { useCartStore } from '../store/cartStore.js';
import { formatNumber } from '../utils/formatNumber.js';
import { useCurrencyStore } from '../store/currencyStore.js'; // 1. IMPORT STORE

// Ngưỡng tối thiểu
const MIN_USD_DISPLAY_THRESHOLD = 1.00;

export default function ItemDetailPage() {
  // 2. LẤY TỶ GIÁ TỪ STORE
  const USD_PER_XU = useCurrencyStore((state) => state.rate);
  const isRateLoading = useCurrencyStore((state) => state.isLoading);

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

  const handleAddToCart = () => {
    if (!item) return;
    let qtyToAdd = Number(quantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      qtyToAdd = 1;
    }
    addItemToCart(item, qtyToAdd);
  };
  
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

  // 3. SỬA LẠI TRẠNG THÁI LOADING
  if (isLoading || isRateLoading) {
    return <p className="text-center text-xl text-gray-400">Đang tải chi tiết...</p>;
  }
  if (error) {
    return <p className="text-center text-xl text-red-500">Lỗi: {error}</p>;
  }
  if (!item) {
    return <p className="text-center text-xl text-gray-400">Không có dữ liệu.</p>;
  }

  const imageUrl = item.thumbnailImageUrl || 'https://placehold.co/600x400/2D3748/FFFFFF?text=TaiLocShop';

  // 4. LOGIC GIÁ MỚI
  const priceCoinNum = parseFloat(item.priceCoin) || 0;
  const calculatedUsd = priceCoinNum * USD_PER_XU;
  const isUsdAvailable = calculatedUsd >= MIN_USD_DISPLAY_THRESHOLD;
  const isCoinOnly = priceCoinNum > 0 && !isUsdAvailable;
  const hasBothPrices = priceCoinNum > 0 && isUsdAvailable;

  return (
    // 5. MỞ RỘNG LAYOUT
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

          {/* 6. KHỐI GIÁ MỚI */}
          <div className="my-6">
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

            {hasBothPrices && (
              <>
                <span className="block text-4xl font-bold text-green-400">
                  ${formatNumber(calculatedUsd)}
                </span>
                <span className="block text-3xl font-bold text-yellow-400">
                  {formatNumber(priceCoinNum)} Xu
                </span>
              </>
            )}
          </div>

          <p className="text-lg text-yellow-400 mb-4">
            Số lượng tồn kho: {formatNumber(item.stockQuantity)}
          </p>

          {/* Khu vực thêm vào giỏ hàng */}
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