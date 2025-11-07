// File: frontend/src/pages/admin/manager/AdminManageVipLevels.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getAllVipLevelsAdmin, 
  createVipLevelAdmin, 
  updateVipLevelAdmin, 
  deleteVipLevelAdmin 
} from '../../../services/adminVipLevelService.js';
import VipLevelModal from '../../../components/admin/VipLevelModal.js';

export default function AdminManageVipLevels() {
  const [vipLevels, setVipLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vipLevelToEdit, setVipLevelToEdit] = useState(null);

  const fetchVipLevels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getAllVipLevelsAdmin();
      setVipLevels(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách cấp VIP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVipLevels();
  }, [fetchVipLevels]);

  // === Xử lý Modal ===
  const handleOpenCreateModal = () => {
    setVipLevelToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vipLevel) => {
    setVipLevelToEdit(vipLevel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVipLevelToEdit(null);
  };

  // === Xử lý CRUD ===
  const handleSaveVipLevel = async (vipLevelData) => {
    try {
      if (vipLevelToEdit) {
        await updateVipLevelAdmin(vipLevelToEdit.id, vipLevelData);
        toast.success('Cập nhật cấp VIP thành công!');
      } else {
        await createVipLevelAdmin(vipLevelData);
        toast.success('Tạo cấp VIP mới thành công!');
      }
      handleCloseModal();
      fetchVipLevels(); // Tải lại danh sách
    } catch (err) {
      const errorMsg = err.response?.data?.errors ? err.response.data.errors.join(', ') : (err.response?.data?.message || 'Thao tác thất bại');
      toast.error(errorMsg);
    }
  };

  const handleDeleteVipLevel = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cấp VIP này? (Sẽ thất bại nếu còn user ở cấp này)')) {
      try {
        await deleteVipLevelAdmin(id);
        toast.success('Xóa cấp VIP thành công!');
        fetchVipLevels(); // Tải lại danh sách
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể xóa';
        toast.error(errorMsg);
      }
    }
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-300">Đang tải cấp độ VIP...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý Cấp độ VIP</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          + Tạo Cấp VIP mới
        </button>
      </div>

      <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên Cấp VIP</th>
              <th className="py-3 px-4 text-left">Cấp (Số)</th>
              <th className="py-3 px-4 text-right">Chi tiêu tối thiểu (Xu)</th>
              <th className="py-3 px-4 text-right">% Giảm giá</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {vipLevels.map((level) => (
              <tr key={level.id} className="hover:bg-gray-700">
                <td className="py-3 px-4 font-medium">{level.name}</td>
                <td className="py-3 px-4 font-mono">{level.levelInt}</td>
                <td className="py-3 px-4 text-right font-mono text-green-400">{level.minSpent}</td>
                <td className="py-3 px-4 text-right font-mono text-pink-400">{level.discountPercent}%</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleOpenEditModal(level)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  {/* Không cho xóa VIP 0 */}
                  {level.minSpent > 0 && (
                    <button
                      onClick={() => handleDeleteVipLevel(level.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {vipLevels.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 px-4 text-center text-gray-400">
                  Chưa có cấp độ VIP nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <VipLevelModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveVipLevel}
        vipLevelToEdit={vipLevelToEdit}
      />
    </div>
  );
}