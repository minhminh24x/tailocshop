// File: frontend/src/components/admin/ItemModal.js
// [CODE ĐÃ SỬA]
import React, { useState, useEffect } from 'react';
import { getAllCategoriesAdmin } from '../../services/adminCategoryService.js';
import toast from 'react-hot-toast';

// Lấy từ schema.prisma
const ITEM_UNITS = ['PIECE', 'STACK', 'SHULKER'];

const initialState = {
  name: '',
  description: '',
  thumbnailImageUrl: '',
  categoryId: '',
  unit: 'PIECE',
  priceUsd: 0,
  priceCoin: 0,
  stockQuantity: 0,
  isActive: true,
};

export default function ItemModal({ isOpen, onClose, onSave, itemToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // [THÊM MỚI] State để quản lý checkbox "Chỉ bán bằng Xu"
  const [isCoinOnly, setIsCoinOnly] = useState(false);

  // 1. Tải danh sách phân loại
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
  }, [isOpen]); // [SỬA] Bỏ dependencies không cần thiết để tránh gọi lại

  // 2. Cập nhật form khi "itemToEdit" thay đổi (khi mở modal edit)
  useEffect(() => {
    if (isOpen && itemToEdit) {
      // [SỬA] Tự động kiểm tra checkbox dựa trên dữ liệu cũ
      const coinOnly = !itemToEdit.priceUsd || itemToEdit.priceUsd <= 0;
      setIsCoinOnly(coinOnly);
      
      setFormData({
        name: itemToEdit.name || '',
        description: itemToEdit.description || '',
        thumbnailImageUrl: itemToEdit.thumbnailImageUrl || '',
        categoryId: itemToEdit.categoryId || '',
        unit: itemToEdit.unit || 'PIECE',
        priceUsd: itemToEdit.priceUsd || 0,
        priceCoin: itemToEdit.priceCoin || 0,
        stockQuantity: itemToEdit.stockQuantity || 0,
        isActive: itemToEdit.isActive,
      });
    } else if (isOpen && !itemToEdit) {
      // [SỬA] Reset form và checkbox khi tạo mới
      setIsCoinOnly(false); // Mặc định cho phép bán USD
      setFormData({
        ...initialState,
        categoryId: categories.length > 0 ? categories[0].id : '',
      });
    }
  }, [isOpen, itemToEdit, categories]);

  // [THÊM MỚI] Effect tự động set priceUsd = 0 khi check "Chỉ bán bằng Xu"
  useEffect(() => {
    if (isCoinOnly) {
      setFormData(prev => ({ ...prev, priceUsd: 0 }));
    }
  }, [isCoinOnly]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // [SỬA] Tách logic cho checkbox 'isCoinOnly'
    if (name === 'isCoinOnly') {
      setIsCoinOnly(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const parser = (name === 'stockQuantity') ? parseInt : parseFloat;
    const numValue = parser(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Logic này đã đúng: nếu priceUsd là 0, nó sẽ gửi null
    const itemData = {
      ...formData,
      priceUsd: parseFloat(formData.priceUsd) || null,
      priceCoin: parseFloat(formData.priceCoin) || null,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
    };
    
    // Yêu cầu của validation là priceCoin phải có (hoặc priceUsd)
    // Chúng ta nên đảm bảo ít nhất 1 giá trị được gửi
    if (!itemData.priceCoin && !itemData.priceUsd) {
        toast.error('Vật phẩm phải có giá (Xu hoặc USD)');
        setIsLoading(false);
        return;
    }
    if (!itemData.priceCoin && itemData.priceUsd) {
        // Nếu admin chỉ nhập giá USD, ta tự set giá Xu = 0 (hoặc null)
        itemData.priceCoin = null;
    }
    if (!itemData.priceCoin && isCoinOnly) {
        toast.error('Nếu chỉ bán bằng Xu, vui lòng nhập giá Xu');
        setIsLoading(false);
        return;
    }

    if (!itemData.priceUsd) delete itemData.priceUsd;
    if (!itemData.priceCoin) delete itemData.priceCoin;
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
                required disabled={isLoading} />
            </div>

            {/* Phân loại */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-2">Phân loại</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading || isLoadingCategories} required>
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
                disabled={isLoading} required>
                {ITEM_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Giá Coin */}
            <div>
              <label htmlFor="priceCoin" className="block text-sm font-medium text-gray-300 mb-2">Giá (Xu)</label>
              <input type="number" step="0.01" min="0" id="priceCoin" name="priceCoin" value={formData.priceCoin} onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading} />
            </div>
            
            {/* [SỬA] Nhóm Giá USD và Checkbox */}
            <div>
              <label htmlFor="priceUsd" className="block text-sm font-medium text-gray-300 mb-2">Giá (USD)</label>
              <input type="number" step="0.01" min="0" id="priceUsd" name="priceUsd" value={formData.priceUsd} onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500
                          disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isLoading || isCoinOnly} // Vô hiệu hóa khi check
              />
            </div>
            
            {/* [THÊM MỚI] Checkbox "Chỉ bán bằng Xu" */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-gray-300">
                <input type="checkbox" id="isCoinOnly" name="isCoinOnly" checked={isCoinOnly} onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-pink-500 focus:ring-pink-500"
                  disabled={isLoading} />
                <span>Chỉ bán bằng Xu (Tự động set giá USD về 0)</span>
              </label>
            </div>


            {/* Tồn kho */}
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-300 mb-2">Tồn kho</label>
              <input type="number" min="0" id="stockQuantity" name="stockQuantity" value={formData.stockQuantity} onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading} />
            </div>
            
            {/* Ảnh thumbnail */}
            <div className="md:col-span-2">
              <label htmlFor="thumbnailImageUrl" className="block text-sm font-medium text-gray-300 mb-2">Link ảnh (Tùy chọn)</label>
              <input type="text" id="thumbnailImageUrl" name="thumbnailImageUrl" value={formData.thumbnailImageUrl} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://..."
                disabled={isLoading} />
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Mô tả (Tùv chọn)</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isLoading}></textarea>
            </div>

            {/* Kích hoạt */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-gray-300">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-pink-500 focus:ring-pink-500"
                  disabled={isLoading} />
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
              disabled={isLoading || isLoadingCategories}
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