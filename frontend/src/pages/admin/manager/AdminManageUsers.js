// File: frontend/src/pages/admin/manager/AdminManageUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../../services/adminUserService';
import CreateUserModal from '../../../components/admin/CreateUserModal';
import Pagination from '../../../components/common/Pagination';
import { FaSearch, FaCoins } from 'react-icons/fa';
import { formatNumber } from '../../../utils/formatNumber';

export default function AdminManageUsers({ type = 'STAFF' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // [NÂNG CẤP] Server-side Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isCustomerMode = type === 'CUSTOMER';
  const pageTitle = isCustomerMode ? 'Quản lý Khách hàng' : 'Quản lý Nhân sự';
  const rolesToFetch = isCustomerMode ? ['CUSTOMER'] : ['STAFF', 'SUPPLIER'];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // [NÂNG CẤP] Fetch với server-side pagination
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        roles: rolesToFetch,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await getUsers(params);

      // [FIX] API giờ trả về { data: [...], pagination: {...} }
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, rolesToFetch, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset khi đổi type (Customer vs Staff)
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

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">
          {pageTitle}
          <span className="text-lg font-normal text-gray-400 ml-2">({totalItems} người)</span>
        </h1>
        {!isCustomerMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition duration-200"
          >
            + Tạo tài khoản mới
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="w-full md:w-1/3 p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
      </div>

      {loading ? (
        <p className="text-gray-300">Đang tải...</p>
      ) : (
        <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-left">Tên In-game</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Chức vụ</th>
                {isCustomerMode && <th className="p-4 text-left">VIP</th>}
                {isCustomerMode && <th className="p-4 text-right">Tổng chi tiêu</th>}
                <th className="p-4 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleRowClick(user.id)}
                >
                  <td className="p-4 font-medium text-pink-400">{user.inGameName}</td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-900 text-red-200' :
                        user.role === 'STAFF' ? 'bg-green-900 text-green-200' :
                          user.role === 'SUPPLIER' ? 'bg-blue-900 text-blue-200' :
                            'bg-gray-700 text-gray-300'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  {isCustomerMode && (
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-900 text-yellow-200">
                        VIP {user.vipLevel?.level || 0}
                      </span>
                    </td>
                  )}
                  {isCustomerMode && (
                    <td className="p-4 text-right">
                      <span className="flex items-center justify-end text-yellow-400">
                        <FaCoins size={14} className="mr-1" />
                        {formatNumber(parseFloat(user.totalSpentCoin) || 0)}
                      </span>
                    </td>
                  )}
                  <td className="p-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={isCustomerMode ? 6 : 4} className="p-4 text-center text-gray-400">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && (
        <CreateUserModal
          onClose={() => setIsModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
}