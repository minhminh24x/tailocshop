// File: frontend/src/components/admin/ItemModal.js
// [NÂNG CẤP] Hỗ trợ Multi-Unit System (allowedUnits, baseUnit, basePriceCoin/Usd)
import React, { useState, useEffect } from 'react';
import { getAllCategoriesAdmin } from '../../services/adminCategoryService.js';
import toast from 'react-hot-toast';
import { formatNumber } from '../../utils/formatNumber.js';
import { useCurrencyStore } from '../../store/currencyStore.js';
import { UNIT_MULTIPLIER, UNIT_LABELS } from '../../utils/unitUtils.js';

const ITEM_UNITS = ['PIECE', 'STACK', 'SHULKER'];

// [MỚI] Colors cho mỗi unit type
const UNIT_COLORS = {
  PIECE: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' },
  STACK: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' },
  SHULKER: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-500' }
};

const initialState = {
  name: '',
  description: '',
  thumbnailImageUrl: '',
  categoryId: '',
  allowedUnits: ['PIECE'], // [MỚI] Mảng đơn vị cho phép
  baseUnit: 'PIECE',       // [MỚI] Đơn vị cơ sở để tính giá
  basePriceCoin: '',       // [MỚI] Giá Xu theo baseUnit
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

  // [MỚI] State cho checkbox USD
  const [allowUsdPayment, setAllowUsdPayment] = useState(true);

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
  }, [isOpen, itemToEdit]);

  // Cập nhật form khi "itemToEdit" thay đổi
  useEffect(() => {
    if (isOpen && itemToEdit) {
      // [SỬA] Đọc từ basePriceCoin hoặc fallback về priceCoin
      const basePriceCoin = parseFloat(itemToEdit.basePriceCoin) || parseFloat(itemToEdit.priceCoin) || 0;
      const isUsdAllowed = !!(itemToEdit.basePriceUsd || itemToEdit.priceUsd);

      setFormData({
        name: itemToEdit.name || '',
        description: itemToEdit.description || '',
        thumbnailImageUrl: itemToEdit.thumbnailImageUrl || '',
        categoryId: itemToEdit.categoryId || '',
        allowedUnits: itemToEdit.allowedUnits || ['PIECE'],
        baseUnit: itemToEdit.baseUnit || 'PIECE',
        basePriceCoin: basePriceCoin.toString(),
        stockQuantity: itemToEdit.stockQuantity || 0,
        isActive: itemToEdit.isActive,
      });
      setAllowUsdPayment(isUsdAllowed);

    } else if (isOpen && !itemToEdit) {
      setFormData({
        ...initialState,
        categoryId: categories.length > 0 ? categories[0].id : '',
      });
      setAllowUsdPayment(true);
    }
  }, [isOpen, itemToEdit, categories]);

  // Tự động tính toán giá USD
  useEffect(() => {
    const basePriceCoin = parseFloat(formData.basePriceCoin) || 0;

    if (allowUsdPayment && basePriceCoin > 0 && USD_PER_XU > 0) {
      setCalculatedUsd(basePriceCoin * USD_PER_XU);
    } else {
      setCalculatedUsd(0);
    }
  }, [formData.basePriceCoin, USD_PER_XU, allowUsdPayment]);

  // Hàm xử lý chung
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'allowUsdPayment') {
      setAllowUsdPayment(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // [MỚI] Xử lý toggle allowedUnits checkbox
  const handleUnitToggle = (unit) => {
    setFormData(prev => {
      const currentUnits = prev.allowedUnits || [];
      let newUnits;

      if (currentUnits.includes(unit)) {
        // Không cho bỏ nếu chỉ còn 1 unit
        if (currentUnits.length <= 1) {
          toast.error('Phải có ít nhất một đơn vị được chọn');
          return prev;
        }
        newUnits = currentUnits.filter(u => u !== unit);

        // Nếu baseUnit bị bỏ, chọn đơn vị đầu tiên làm baseUnit mới
        if (prev.baseUnit === unit) {
          return { ...prev, allowedUnits: newUnits, baseUnit: newUnits[0] };
        }
      } else {
        newUnits = [...currentUnits, unit];
      }

      return { ...prev, allowedUnits: newUnits };
    });
  };

  // Hàm xử lý nhập số
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stockQuantity') {
      const numValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) || numValue < 0 ? 0 : numValue,
      }));
    } else if (name === 'basePriceCoin') {
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

    const basePriceCoinNum = parseFloat(formData.basePriceCoin) || 0;
    const basePriceUsdNum = allowUsdPayment ? (basePriceCoinNum * USD_PER_XU) : null;

    if (basePriceCoinNum <= 0) {
      toast.error('Vật phẩm phải có giá Xu > 0');
      setIsLoading(false);
      return;
    }

    if (!formData.allowedUnits || formData.allowedUnits.length === 0) {
      toast.error('Phải chọn ít nhất một đơn vị');
      setIsLoading(false);
      return;
    }

    // [MỚI] Gửi data theo format mới
    const itemData = {
      name: formData.name,
      description: formData.description || undefined,
      thumbnailImageUrl: formData.thumbnailImageUrl || undefined,
      categoryId: formData.categoryId,
      allowedUnits: formData.allowedUnits,
      baseUnit: formData.baseUnit,
      basePriceCoin: basePriceCoinNum,
      basePriceUsd: basePriceUsdNum,
      // [DEPRECATED] Gửi cả giá cũ để tương thích
      priceCoin: basePriceCoinNum,
      priceUsd: basePriceUsdNum,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      isActive: formData.isActive,
    };

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
            {/* Tên */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Tên Vật phẩm</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required disabled={isLoading || isRateLoading} />
            </div>

            {/* Phân loại */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-2">Phân loại</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isLoading || isLoadingCategories || isRateLoading} required>
                <option value="">{isLoadingCategories ? 'Đang tải...' : '-- Chọn --'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* [MỚI] Đơn vị cơ sở (baseUnit) */}
            <div>
              <label htmlFor="baseUnit" className="block text-sm font-medium text-gray-300 mb-2">
                Đơn vị tính giá
                <span className="text-xs text-gray-500 ml-1">(nhập giá cho đơn vị này)</span>
              </label>
              <select id="baseUnit" name="baseUnit" value={formData.baseUnit} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isLoading || isRateLoading} required>
                {(formData.allowedUnits || ['PIECE']).map(unit => (
                  <option key={unit} value={unit}>{UNIT_LABELS[unit] || unit}</option>
                ))}
              </select>
            </div>

            {/* [MỚI] Allowed Units Checkboxes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Đơn vị cho phép bán
                <span className="text-xs text-gray-500 ml-1">(khách có thể chọn mua theo đơn vị nào)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {ITEM_UNITS.map(unit => {
                  const isChecked = (formData.allowedUnits || []).includes(unit);
                  const colors = UNIT_COLORS[unit];
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleUnitToggle(unit)}
                      disabled={isLoading || isRateLoading}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${isChecked
                          ? `${colors.bg} text-white border-transparent`
                          : `bg-gray-700 ${colors.text} ${colors.border}`
                        } disabled:opacity-50`}
                    >
                      {UNIT_LABELS[unit] || unit}
                      {isChecked && formData.baseUnit === unit && (
                        <span className="ml-1 text-xs opacity-75">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ★ = Đơn vị tính giá. Giá các đơn vị khác sẽ tự động tính theo hệ số (STACK = 64, SHULKER = 1728).
              </p>
            </div>

            {/* Giá Coin theo baseUnit */}
            <div>
              <label htmlFor="basePriceCoin" className="block text-sm font-medium text-gray-300 mb-2">
                Giá (Xu) / {formData.baseUnit}
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="basePriceCoin"
                name="basePriceCoin"
                value={formData.basePriceCoin}
                onChange={handleNumericChange}
                placeholder="Ví dụ: 0.2 hoặc 1.5"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isLoading || isRateLoading}
              />
            </div>

            {/* Giá USD (Tự động) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Giá (USD) / {formData.baseUnit} (Tự động)
              </label>
              <div className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-green-400">
                {isRateLoading ? 'Đang tải tỷ giá...' : `$${formatNumber(calculatedUsd)}`}
              </div>
            </div>

            {/* Checkbox Cho phép USD */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  id="allowUsdPayment"
                  name="allowUsdPayment"
                  checked={allowUsdPayment}
                  onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-pink-500 focus:ring-pink-500"
                  disabled={isLoading || isRateLoading} />
                <span>Cho phép thanh toán bằng USD</span>
              </label>
            </div>

            {/* Tồn kho */}
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-300 mb-2">
                Tồn kho (PIECE)
                <span className="text-xs text-gray-500 ml-1">(luôn tính theo piece)</span>
              </label>
              <input
                type="number"
                min="0"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isLoading || isRateLoading}
              />
            </div>

            {/* Link ảnh */}
            <div className="md:col-span-2">
              <label htmlFor="thumbnailImageUrl" className="block text-sm font-medium text-gray-300 mb-2">Link ảnh (Tùy chọn)</label>
              <input type="text" id="thumbnailImageUrl" name="thumbnailImageUrl" value={formData.thumbnailImageUrl} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="https://..."
                disabled={isLoading || isRateLoading} />
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Mô tả (Tùy chọn)</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isLoading || isRateLoading}></textarea>
            </div>

            {/* Kích hoạt */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-gray-300">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-pink-500"
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