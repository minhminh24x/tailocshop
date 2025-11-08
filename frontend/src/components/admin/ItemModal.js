// File: frontend/src/components/admin/ItemModal.js
// [CODE ĐẦY ĐỦ - ĐÃ SỬA LỖI NHẬP SỐ THẬP PHÂN]
import React, { useState, useEffect } from 'react';
import { getAllCategoriesAdmin } from '../../services/adminCategoryService.js';
import toast from 'react-hot-toast';
import { formatNumber } from '../../utils/formatNumber.js';
import { useCurrencyStore } from '../../store/currencyStore.js';

// Lấy từ schema.prisma
const ITEM_UNITS = ['PIECE', 'STACK', 'SHULKER'];

const initialState = {
  name: '',
  description: '',
  thumbnailImageUrl: '',
  categoryId: '',
  unit: 'PIECE',
  priceCoin: '', // [SỬA] Bắt đầu bằng chuỗi rỗng để cho phép gõ tự do
  stockQuantity: 0,
  isActive: true,
};

export default function ItemModal({ isOpen, onClose, onSave, itemToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // Lấy tỷ giá từ store
  const USD_PER_XU = useCurrencyStore((state) => state.rate);
  const isRateLoading = useCurrencyStore((state) => state.isLoading);
  
  const [calculatedUsd, setCalculatedUsd] = useState(0);

  // Tải danh sách phân loại
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCategories(true);
      getAllCategoriesAdmin()
        .then(response => {
          setCategories(response.data);
          if (!itemToEdit && response.data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: response.data[0].id }));
          }
        })
        .catch(() => toast.error('Không thể tải danh sách phân loại'))
        .finally(() => setIsLoadingCategories(false));
    }
  }, [isOpen]);

  // Cập nhật form khi "itemToEdit" thay đổi
  useEffect(() => {
    if (isOpen && itemToEdit) {
      const priceCoin = parseFloat(itemToEdit.priceCoin) || 0;
      setFormData({
        name: itemToEdit.name || '',
        description: itemToEdit.description || '',
        thumbnailImageUrl: itemToEdit.thumbnailImageUrl || '',
        categoryId: itemToEdit.categoryId || '',
        unit: itemToEdit.unit || 'PIECE',
        priceCoin: priceCoin.toString(), // Chuyển về chuỗi
        stockQuantity: itemToEdit.stockQuantity || 0,
        isActive: itemToEdit.isActive,
      });
    } else if (isOpen && !itemToEdit) {
      setFormData({
        ...initialState,
        categoryId: categories.length > 0 ? categories[0].id : '',
      });
    }
  }, [isOpen, itemToEdit, categories]);

  // Tự động tính toán giá USD khi giá Xu hoặc tỷ giá thay đổi
  useEffect(() => {
    // Dùng parseFloat vì formData.priceCoin giờ là string
    const priceCoin = parseFloat(formData.priceCoin) || 0; 
    if (priceCoin > 0 && USD_PER_XU > 0) {
      setCalculatedUsd(priceCoin * USD_PER_XU);
    } else {
      setCalculatedUsd(0);
    }
  }, [formData.priceCoin, USD_PER_XU]);

  // Hàm xử lý chung (cho Tên, Mô tả, v.v.)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // [SỬA] Hàm xử lý nhập số đã được sửa
  const handleNumericChange = (e) => {
    const { name, value } = e.target;

    if (name === 'stockQuantity') {
      // Tồn kho phải là số nguyên
      const numValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) || numValue < 0 ? 0 : numValue,
      }));
    } else if (name === 'priceCoin') {
      // Giá Xu: Cho phép gõ chuỗi (ví dụ: "1.5", "0.", "0.2")
      // Chỉ lọc các ký tự không phải là số hoặc dấu chấm
      const sanitizedValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Dùng parseFloat vì formData.priceCoin là string
    const priceCoinNum = parseFloat(formData.priceCoin) || 0;
    const priceUsdNum = priceCoinNum * USD_PER_XU;

    if (priceCoinNum <= 0) {
        toast.error('Vật phẩm phải có giá Xu > 0');
        setIsLoading(false);
        return;
    }

    const itemData = {
      ...formData,
      priceCoin: priceCoinNum,
      priceUsd: priceUsdNum,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
    };
    
    if (!itemData.description) delete itemData.description;
    if (!itemData.thumbnailImageUrl) delete itemData.thumbnailImageUrl;

    await onSave(itemData);
    setIsLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-xl bg-gray-800 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            {itemToEdit ? 'Chỉnh sửa Vật phẩm' : 'Tạo Vật phẩm mới'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên Vật phẩm */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Tên Vật phẩm</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading || isRateLoading} />
            </div>

            {/* Phân loại */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-2">Phân loại</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading || isLoadingCategories || isRateLoading} required>
                <option value="">{isLoadingCategories ? 'Đang tải...' : '-- Chọn --'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Đơn vị */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-2">Đơn vị</label>
              <select id="unit" name="unit" value={formData.unit} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading || isRateLoading} required>
                {ITEM_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Giá Coin */}
            <div>
              <label htmlFor="priceCoin" className="block text-sm font-medium text-gray-300 mb-2">Giá (Xu)</label>
              {/* [SỬA] Đổi type="number" thành type="text" để cho phép gõ "0." */}
              <input 
                type="text" 
                inputMode="decimal"
                id="priceCoin" 
                name="priceCoin" 
                value={formData.priceCoin} 
                onChange={handleNumericChange}
                placeholder="Ví dụ: 0.2 hoặc 1.5"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading || isRateLoading} 
              />
            </div>

            {/* Giá USD (Tự động) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Giá (USD) (Tự động)</label>
              <div className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-green-400">
                {isRateLoading ? 'Đang tải tỷ giá...' : `$${formatNumber(calculatedUsd)}`}
              </div>
            </div>

            {/* Tồn kho */}
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-300 mb-2">Tồn kho</label>
              <input 
                type="number" 
                min="0" 
                id="stockQuantity" 
                name="stockQuantity" 
                value={formData.stockQuantity} 
                onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading || isRateLoading} 
              />
            </div>
            
            {/* Ảnh thumbnail */}
            <div className="md:col-span-2">
              <label htmlFor="thumbnailImageUrl" className="block text-sm font-medium text-gray-300 mb-2">Link ảnh (Tùy chọn)</label>
              <input type="text" id="thumbnailImageUrl" name="thumbnailImageUrl" value={formData.thumbnailImageUrl} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://..."
                disabled={isLoading || isRateLoading} />
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Mô tả (Tùy chọn)</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading || isRateLoading}></textarea>
            </div>

            {/* Kích hoạt */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-gray-300">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-pink-500 focus:ring-pink-500"
                  disabled={isLoading || isRateLoading} />
                <span>Kích hoạt (Hiển thị vật phẩm này cho khách)</span>
              </label>
            </div>
          </div>

          {/* Nút bấm */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingCategories || isRateLoading}
              className="px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition duration-200 disabled:bg-gray-500"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}