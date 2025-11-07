// File: frontend/src/components/admin/CategoryModal.js
import React, { useState, useEffect } from 'react';

/**
 * Modal để tạo hoặc chỉnh sửa Phân loại
 * @param {object} props
 * @param {boolean} props.isOpen - Trạng thái đóng/mở modal
 * @param {function} props.onClose - Hàm để đóng modal
 * @param {function} props.onSave - Hàm để lưu (tạo mới hoặc cập nhật)
 * @param {object | null} props.categoryToEdit - Dữ liệu của category cần sửa (nếu là null thì là tạo mới)
 * @param {Array} props.allCategories - Danh sách tất cả category (để chọn cha)
 */
export default function CategoryModal({ isOpen, onClose, onSave, categoryToEdit, allCategories }) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(null); // Sử dụng null cho "Không có"
  const [isLoading, setIsLoading] = useState(false);

  // Khi modal mở hoặc categoryToEdit thay đổi, cập nhật state
  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setParentId(categoryToEdit.parentId || null);
      } else {
        // Reset form khi tạo mới
        setName('');
        setParentId(null);
      }
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const categoryData = {
      name,
      // Nếu parentId là "null" (chuỗi) hoặc null (thật), gửi null
      parentId: parentId === "null" ? null : parentId, 
    };
    
    await onSave(categoryData);
    setIsLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  // Lọc danh sách cha: không thể chọn chính mình làm cha
  const parentOptions = allCategories.filter(cat => cat.id !== categoryToEdit?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-gray-800 shadow-2xl border border-gray-700">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-2xl font-bold text-white mb-4">
            {categoryToEdit ? 'Chỉnh sửa Phân loại' : 'Tạo Phân loại mới'}
          </h3>
          
          {/* Tên Phân loại */}
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-2">
              Tên Phân loại
            </label>
            <input
              type="text"
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              disabled={isLoading}
            />
          </div>

          {/* Phân loại cha */}
          <div className="mb-6">
            <label htmlFor="categoryParent" className="block text-sm font-medium text-gray-300 mb-2">
              Phân loại cha (Tùy chọn)
            </label>
            <select
              id="categoryParent"
              value={parentId || "null"} // Hiển thị "Không có" nếu parentId là null
              onChange={(e) => setParentId(e.target.value === "null" ? null : e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isLoading}
            >
              <option value="null">-- Không có --</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nút bấm */}
          <div className="flex justify-end space-x-3">
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
              disabled={isLoading}
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