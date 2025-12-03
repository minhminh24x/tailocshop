// File: frontend/src/pages/staff/StaffSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const StaffSidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { name: 'Tổng quan', path: '/staff/dashboard', icon: <i className="fas fa-home w-6"></i> },
    { name: 'Quản lý Đơn hàng', path: '/staff/orders', icon: <i className="fas fa-receipt w-6"></i> },
    { name: 'Quản lý Nhập kho', path: '/staff/manage-submissions', icon: <i className="fas fa-dolly w-6"></i> },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Staff Panel
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg hover:bg-gray-700 ${isActive ? 'bg-blue-600' : ''
              }`
            }
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center p-3 rounded-lg hover:bg-red-700"
        >
          <i className="fas fa-sign-out-alt w-6"></i>
          <span className="ml-3">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;