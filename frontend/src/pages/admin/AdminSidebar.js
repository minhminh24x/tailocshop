// File: frontend/src/pages/admin/AdminSidebar.js
import React from 'react';
// [SỬA] Dùng NavLink thay vì Link để có style active
import { NavLink } from 'react-router-dom';

// Hàm helper để tạo className cho NavLink
// Nó sẽ thêm class 'active-link' nếu route đang được chọn
const getNavLinkClass = ({ isActive }) => {
  const baseClasses = "block w-full text-left p-3 rounded-md transition-colors duration-200 hover:bg-gray-700";
  const activeClasses = "bg-pink-600 text-white font-bold shadow-lg"; // Class khi được chọn
  const inactiveClasses = "text-gray-300 hover:text-white"; // Class khi không được chọn

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
};

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 p-4 shadow-xl">
      <nav className="flex flex-col space-y-2">

        {/* [SỬA] Sử dụng NavLink và áp dụng style */}
        <NavLink to="/admin/dashboard" className={getNavLinkClass}>
          🏠 Tổng quan (Dashboard)
        </NavLink>

        {/* --- CÁC NÚT CHỨC NĂNG MỚI --- */}

        <NavLink to="/admin/orders" className={getNavLinkClass}>
          🛒 Quản lý Đơn hàng
        </NavLink>

        <NavLink to="/admin/items" className={getNavLinkClass}>
          📦 Quản lý Vật phẩm
        </NavLink>

        <NavLink to="/admin/categories" className={getNavLinkClass}>
          🗂️ Quản lý Phân loại
        </NavLink>
        
        {/* [SỬA] Dùng 'getNavLinkClass' và emoji */}
        <NavLink to="/admin/timeslots" className={getNavLinkClass}>
          🕒 Quản lý Khung giờ
        </NavLink>

        <NavLink to="/admin/manage-submissions" className={getNavLinkClass}>
          📊 Quản lý Kho
        </NavLink>
        
        <NavLink to="/admin/manage-customers" className={getNavLinkClass}>
          📊 Quản lý Khách hàng
        </NavLink>
        
        <NavLink to="/admin/manage-users" className={getNavLinkClass}>
          📊 Quản lý Nhân sự
        </NavLink>
        
        <NavLink to="/admin/rates" className={getNavLinkClass}>
          💱 Quản lý Tỷ giá
        </NavLink>
        
        <NavLink to="/admin/users" className={getNavLinkClass}>
          👥 Quản lý Người dùng
        </NavLink>

        {/* [SỬA] Dùng 'getNavLinkClass' và emoji */}
        <NavLink to="/admin/vip-levels" className={getNavLinkClass}>
          ⭐ Quản lý Cấp VIP
        </NavLink>
        
        {/* (Bạn có thể thêm các link khác ở đây sau) */}

      </nav>
    </aside>
  );
}