import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

const UserProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  // Thông thường, trang này sẽ được bảo vệ bởi UserProtectedRoute
  // nhưng chúng ta vẫn kiểm tra user ở đây để đề phòng
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hồ Sơ Của Bạn</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Thông tin tài khoản</h2>
          <div className="space-y-3">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Tên trong game:</strong> {user.inGameName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Ngày tham gia:</strong> {formatDate(user.createdAt)}</p>
            <p><strong>Vai trò:</strong> {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Cấp độ VIP</h2>
          {/* TODO: 
            - Logic hiển thị cấp VIP hiện tại của user
            - Hiển thị điểm tích luỹ
            - Hiển thị lợi ích của cấp VIP
          */}
          <p className="text-gray-600">
            {user.vipLevel ? `Cấp VIP hiện tại: ${user.vipLevel.name}` : 'Chưa có cấp VIP.'}
          </p>
          <p className="text-gray-600 mt-2">Tính năng này đang được phát triển!</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Đổi Mật Khẩu</h2>
          {/* TODO: 
            - Form nhập mật khẩu cũ
            - Form nhập mật khẩu mới
            - Form xác nhận mật khẩu mới
          */}
          <p className="text-gray-600">Tính năng này đang được phát triển!</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;