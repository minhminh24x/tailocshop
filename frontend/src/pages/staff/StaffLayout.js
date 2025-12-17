// File: frontend/src/pages/staff/StaffLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import StaffHeader from './StaffHeader'; // [THÊM] Tạo header riêng cho Staff

/**
 * [FIX] Cấu trúc layout giống AdminLayout:
 * - Header cố định ở trên
 * - Sidebar bên trái
 * - Nội dung chính ở giữa
 */
const StaffLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header cố định ở trên */}
      <StaffHeader />

      <div className="flex flex-1">
        {/* Sidebar cố định bên trái */}
        <StaffSidebar />

        {/* Phần nội dung chính */}
        <main className="flex-1 p-6 bg-gray-800 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;