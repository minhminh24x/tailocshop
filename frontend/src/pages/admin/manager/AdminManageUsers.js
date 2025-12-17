// File: frontend/src/pages/admin/manager/AdminManageUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUsers, banUser } from '../../../services/adminUserService';
import CreateUserModal from '../../../components/admin/CreateUserModal';
import BanUserModal from '../../../components/admin/BanUserModal';
import Pagination from '../../../components/common/Pagination';
import { FaSearch, FaCoins, FaPlus, FaBan, FaUnlock } from 'react-icons/fa';
import { formatNumber } from '../../../utils/formatNumber';

export default function AdminManageUsers({ type = 'STAFF' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isCustomerMode = type === 'CUSTOMER';
  const pageTitle = isCustomerMode ? 'Quản lý Khách hàng' : 'Quản lý Nhân sự';

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const roles = type === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF,SUPPLIER';
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        roles: roles,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await getUsers(params);
      setUsers(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalItems(response?.pagination?.total || 0);
    } catch (error) {
      console.error('[AdminManageUsers] Error:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, type]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset khi đổi type
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [type]);

  const handleUserCreated = () => {
    setIsModalOpen(false);
    fetchUsers();
    toast.success('Tạo tài khoản thành công!');
  };

  const handleRowClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  // Ban/Unban handlers
  const handleBanClick = (e, user) => {
    e.stopPropagation();
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const handleUnbanClick = async (e, user) => {
    e.stopPropagation();
    if (!window.confirm(`Mở khóa tài khoản ${user.inGameName}?`)) return;

    try {
      await banUser(user.id, { banned: false });
      toast.success(`Đã mở khóa ${user.inGameName}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi mở khóa');
    }
  };

  const handleBanUser = async (banData) => {
    try {
      await banUser(selectedUser.id, banData);
      toast.success(`Đã khóa ${selectedUser.inGameName}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi khóa');
      throw error;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
        {!isCustomerMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            <FaPlus /> Tạo tài khoản mới
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-white/10">
        <table className="min-w-full text-white">
          <thead className="bg-slate-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên In-game</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-center">Vai trò</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              {isCustomerMode && (
                <>
                  <th className="py-3 px-4 text-center">Cấp VIP</th>
                  <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                </>
              )}
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={isCustomerMode ? 7 : 5} className="py-8 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={isCustomerMode ? 7 : 5} className="py-8 text-center text-gray-400">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{user.inGameName}</td>
                  <td className="py-3 px-4 text-gray-400">{user.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-900/50 text-red-300' :
                        user.role === 'STAFF' ? 'bg-blue-900/50 text-blue-300' :
                          user.role === 'SUPPLIER' ? 'bg-green-900/50 text-green-300' :
                            'bg-gray-700 text-gray-300'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.isBanned ? (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-900/50 text-red-300">
                        🔒 Bị khóa
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-green-900/50 text-green-300">
                        ✓ Hoạt động
                      </span>
                    )}
                  </td>
                  {isCustomerMode && (
                    <>
                      <td className="py-3 px-4 text-center">
                        <span className="text-yellow-400 font-medium">
                          {user.vipLevel?.name || 'Tân Thủ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="flex items-center justify-end gap-1 text-green-400">
                          <FaCoins className="text-yellow-500" />
                          {formatNumber(user.totalSpentCoin || 0)}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="py-3 px-4 text-center">
                    {user.role !== 'ADMIN' && (
                      user.isBanned ? (
                        <button
                          onClick={(e) => handleUnbanClick(e, user)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 mx-auto"
                        >
                          <FaUnlock /> Mở khóa
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleBanClick(e, user)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 mx-auto"
                        >
                          <FaBan /> Khóa
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <p className="text-gray-400 text-sm mt-4">
        Tổng cộng: <strong>{totalItems}</strong> người dùng
      </p>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* Ban User Modal */}
      <BanUserModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        user={selectedUser}
        onBan={handleBanUser}
      />
    </div>
  );
}