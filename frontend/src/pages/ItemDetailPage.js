// File: frontend/src/pages/ItemDetailPage.js
// [NÂNG CẤP] Dùng React Query để cache item data
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useItem } from '../hooks/useItems.js';
import { useCartStore } from '../store/cartStore.js';
import { formatNumber } from '../utils/formatNumber.js';
import {
  UNIT_MULTIPLIER,
  UNIT_LABELS,
  getStockInUnit,
  getUnitBreakdown
} from '../utils/unitUtils.js';
import WishlistButton from '../components/item/WishlistButton.js';
import ItemReviews from '../components/item/ItemReviews.js';

const MIN_USD_DISPLAY_THRESHOLD = 1.00;

export default function ItemDetailPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const addItemToCart = useCartStore((state) => state.addItem);

  // [MỚI] React Query hook - cache 5 phút
  const { data: item, isLoading, error: queryError } = useItem(slug);
  const error = queryError?.response?.data?.message || (queryError ? 'Không tìm thấy vật phẩm' : null);

  // Set default unit khi item load xong
  useEffect(() => {
    if (item && !selectedUnit) {
      if (item.allowedUnits?.length > 0) {
        setSelectedUnit(item.allowedUnits[0]);
      } else {
        setSelectedUnit(item.baseUnit || 'PIECE');
      }
    }
  }, [item, selectedUnit]);

  // Tính giá và stock cho unit đã chọn
  const { currentPriceCoin, currentPriceUsd, currentStock } = useMemo(() => {
    if (!item || !selectedUnit) {
      return { currentPriceCoin: 0, currentPriceUsd: 0, currentStock: 0 };
    }

    // Nếu có pricesPerUnit từ API, dùng nó
    if (item.pricesPerUnit && item.pricesPerUnit[selectedUnit]) {
      const unitPrices = item.pricesPerUnit[selectedUnit];
      return {
        currentPriceCoin: unitPrices.priceCoin || 0,
        currentPriceUsd: unitPrices.priceUsd || 0,
        currentStock: unitPrices.stock || 0
      };
    }

    // Fallback: tính từ basePrice
    const basePriceCoin = parseFloat(item.basePriceCoin) || parseFloat(item.priceCoin) || 0;
    const basePriceUsd = parseFloat(item.basePriceUsd) || parseFloat(item.priceUsd) || 0;
    const baseUnit = item.baseUnit || 'PIECE';

    const baseMultiplier = UNIT_MULTIPLIER[baseUnit] || 1;
    const targetMultiplier = UNIT_MULTIPLIER[selectedUnit] || 1;
    const ratio = targetMultiplier / baseMultiplier;

    return {
      currentPriceCoin: Math.round(basePriceCoin * ratio * 100) / 100,
      currentPriceUsd: Math.round(basePriceUsd * ratio * 100) / 100,
      currentStock: getStockInUnit(item.stockQuantity || 0, selectedUnit)
    };
  }, [item, selectedUnit]);

  // Tính breakdown khi nhập số lượng
  const breakdown = useMemo(() => {
    if (!selectedUnit) return null;
    const pieces = quantity * (UNIT_MULTIPLIER[selectedUnit] || 1);
    return getUnitBreakdown(pieces);
  }, [quantity, selectedUnit]);

  const handleAddToCart = () => {
    if (!item || !selectedUnit) return;
    let qtyToAdd = Number(quantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      qtyToAdd = 1;
    }
    // [SỬA] Thêm unit vào cart item
    addItemToCart(item, qtyToAdd, selectedUnit);
  };

  const handleQuantityChange = (e) => {
    let newQty = parseInt(e.target.value, 10);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    if (currentStock > 0 && newQty > currentStock) {
      newQty = currentStock;
    }
    setQuantity(newQty);
  };

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
  const allowedUnits = item.allowedUnits || ['PIECE'];

  const isUsdAvailable = currentPriceUsd >= MIN_USD_DISPLAY_THRESHOLD;
  const isCoinOnly = currentPriceCoin > 0 && !isUsdAvailable;
  const isUsdOnly = isUsdAvailable && currentPriceCoin <= 0;
  const hasBothPrices = currentPriceCoin > 0 && isUsdAvailable;

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-7xl mx-auto">
      <div className="md:flex">
        {/* Cột ảnh */}
        <div className="md:w-1/2 relative">
          <img src={imageUrl} alt={item.name} className="w-full h-64 md:h-full object-cover" />
          <div className="absolute top-4 right-4">
            <WishlistButton itemId={item.id} size="lg" />
          </div>
        </div>

        {/* Cột thông tin */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <h1 className="text-4xl font-bold text-white mb-2">{item.name}</h1>

          {/* [MỚI] Unit Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {allowedUnits.map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedUnit === unit
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {UNIT_LABELS[unit] || unit}
              </button>
            ))}
          </div>

          {item.category && (
            <p className="text-gray-400 text-md">Phân loại: {item.category.name}</p>
          )}

          <p className="text-gray-300 mt-4 text-lg">
            {item.description || "Vật phẩm này chưa có mô tả."}
          </p>

          {/* KHỐI GIÁ - Hiển thị theo unit đã chọn */}
          <div className="my-6">
            {isCoinOnly && (
              <>
                <span className="inline-block bg-yellow-600 text-yellow-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                  Chỉ Được Bán Bằng Xu
                </span>
                <span className="block text-4xl font-bold text-yellow-400">
                  {formatNumber(currentPriceCoin)} Xu <span className="text-lg text-gray-400">/ {selectedUnit}</span>
                </span>
              </>
            )}

            {isUsdOnly && (
              <>
                <span className="inline-block bg-green-600 text-green-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                  Có thể mua bằng USD
                </span>
                <span className="block text-4xl font-bold text-green-400">
                  ${formatNumber(currentPriceUsd)} <span className="text-lg text-gray-400">/ {selectedUnit}</span>
                </span>
              </>
            )}

            {hasBothPrices && (
              <>
                <span className="block text-4xl font-bold text-green-400">
                  ${formatNumber(currentPriceUsd)} <span className="text-lg text-gray-400">/ {selectedUnit}</span>
                </span>
                <span className="block text-3xl font-bold text-yellow-400">
                  {formatNumber(currentPriceCoin)} Xu <span className="text-lg text-gray-400">/ {selectedUnit}</span>
                </span>
              </>
            )}
          </div>

          {/* Stock theo unit đã chọn */}
          <p className="text-lg text-yellow-400 mb-2">
            Tồn kho: {formatNumber(currentStock)} {selectedUnit}
          </p>

          {/* [MỚI] Hiển thị breakdown khi nhập số lượng */}
          {breakdown && quantity > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300">
                <span className="text-white font-semibold">{quantity} {selectedUnit}</span> = {' '}
                <span className="text-yellow-400">{formatNumber(breakdown.pieces)} pieces</span> = {' '}
                <span className="text-blue-400">{breakdown.stacks} stacks</span> = {' '}
                <span className="text-purple-400">{breakdown.shulkers} shulkers</span>
              </p>
            </div>
          )}

          {/* Khu vực thêm vào giỏ hàng */}
          <div className="mt-auto">
            {currentStock > 0 ? (
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={currentStock}
                  className="w-24 px-3 py-3 bg-gray-700 border border-gray-600 rounded text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
                >
                  Thêm {quantity} {selectedUnit} vào giỏ
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

      {/* Reviews Section */}
      <div className="mt-8">
        <ItemReviews itemId={item.id} />
      </div>
    </div>
  );
}