// File: frontend/src/components/admin/VipLevelModal.js
import React, { useState, useEffect } from 'react';

const initialState = {
  name: '',
  levelInt: 0,
  minSpent: 0,
  discountPercent: 0,
};

export default function VipLevelModal({ isOpen, onClose, onSave, vipLevelToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (vipLevelToEdit) {
        setFormData({
          name: vipLevelToEdit.name,
          levelInt: vipLevelToEdit.levelInt,
          minSpent: vipLevelToEdit.minSpent,
          discountPercent: vipLevelToEdit.discountPercent,
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [isOpen, vipLevelToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const parser = (name === 'discountPercent') ? parseFloat : parseInt;
    const numValue = parser(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const vipData = {
      ...formData,
      levelInt: parseInt(formData.levelInt) || 0,
      minSpent: parseInt(formData.minSpent) || 0,
      discountPercent: parseFloat(formData.discountPercent) || 0,
    };
    
    await onSave(vipData);
    setIsLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-gray-800 shadow-2xl border border-gray-700">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            {vipLevelToEdit ? 'Chỉnh sửa Cấp VIP' : 'Tạo Cấp VIP mới'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Tên Cấp VIP */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Tên Cấp VIP</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading} />
            </div>

            {/* Cấp độ (Level) */}
            <div>
              <label htmlFor="levelInt" className="block text-sm font-medium text-gray-300 mb-2">Cấp độ (Số)</label>
              <input type="number" min="0" id="levelInt" name="levelInt" value={formData.levelInt} onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading} />
            </div>

            {/* Chi tiêu tối thiểu */}
            <div className="col-span-2">
              <label htmlFor="minSpent" className="block text-sm font-medium text-gray-300 mb-2">Chi tiêu tối thiểu (Xu)</label>
              <input type="number" min="0" id="minSpent" name="minSpent" value={formData.minSpent} onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading || (vipLevelToEdit && vipLevelToEdit.minSpent === 0)} 
                />
              {vipLevelToEdit && vipLevelToEdit.minSpent === 0 && (
                <p className="text-xs text-yellow-400 mt-1">Không thể sửa mốc chi tiêu của VIP 0.</p>
              )}
            </div>

            {/* % Giảm giá */}
            <div className="col-span-2">
              <label htmlFor="discountPercent" className="block text-sm font-medium text-gray-300 mb-2">% Giảm giá</label>
              <input type="number" step="0.1" min="0" max="100" id="discountPercent" name="discountPercent" value={formData.discountPercent} onChange={handleNumericChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required disabled={isLoading} />
            </div>
          </div>
          
          {/* Nút bấm */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition duration-200">
              Hủy
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition duration-200 disabled:bg-gray-500">
              {isLoading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}