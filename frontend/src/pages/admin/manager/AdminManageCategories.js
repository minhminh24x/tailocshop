// File: frontend/src/pages/admin/manager/AdminManageCategories.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getAllCategoriesAdmin, 
  createCategoryAdmin, 
  updateCategoryAdmin, 
  deleteCategoryAdmin 
} from '../../../services/adminCategoryService.js';
import CategoryModal from '../../../components/admin/CategoryModal.js';

export default function AdminManageCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null); // null = tạo mới

  // Hàm tải dữ liệu
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getAllCategoriesAdmin();
      setCategories(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách phân loại';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // === Xử lý Modal ===
  const handleOpenCreateModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
  };

  // === Xử lý CRUD ===
  const handleSaveCategory = async (categoryData) => {
    try {
      if (categoryToEdit) {
        // Cập nhật
        await updateCategoryAdmin(categoryToEdit.id, categoryData);
        toast.success('Cập nhật phân loại thành công!');
      } else {
        // Tạo mới
        await createCategoryAdmin(categoryData);
        toast.success('Tạo phân loại mới thành công!');
      }
      handleCloseModal();
      fetchCategories(); // Tải lại danh sách
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
      toast.error(errorMsg);
      // Không đóng modal nếu có lỗi
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phân loại này? (Nếu có vật phẩm đang dùng, sẽ không xóa được)')) {
      try {
        await deleteCategoryAdmin(id);
        toast.success('Xóa phân loại thành công!');
        fetchCategories(); // Tải lại danh sách
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể xóa phân loại';
        toast.error(errorMsg);
      }
    }
  };

  // === Render ===
  if (isLoading) {
    return <p className="text-center text-lg text-gray-300">Đang tải phân loại...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý Phân loại</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          + Tạo Phân loại mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên Phân loại</th>
              <th className="py-3 px-4 text-left">Phân loại cha</th>
              <th className="py-3 px-4 text-left">Slug</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-700">
                <td className="py-3 px-4 font-medium">{cat.name}</td>
                <td className="py-3 px-4 text-gray-400">{cat.parent ? cat.parent.name : 'N/A'}</td>
                <td className="py-3 px-4 font-mono text-sm text-gray-400">{cat.slug}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 px-4 text-center text-gray-400">
                  Chưa có phân loại nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo/Sửa */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
        allCategories={categories}
      />
    </div>
  );
}