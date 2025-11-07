// File: frontend/src/pages/admin/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader.js';
import AdminSidebar from './AdminSidebar.js';
import AdminFooter from './AdminFooter.js';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header cố định ở trên */}
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar cố định bên trái */}
        <AdminSidebar />

        {/* Phần nội dung chính, sẽ thay đổi theo route */}
        <main className="flex-1 p-6 bg-gray-800">
          {/* <Outlet /> là nơi các trang con (Dashboard, ManageItems...) sẽ được render */}
          <Outlet />
        </main>
      </div>

      {/* Footer cố định ở dưới */}
      <AdminFooter />
    </div>
  );
}