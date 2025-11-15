// File: frontend/src/pages/supplier/SupplierSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const SupplierSidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { name: 'Bảng điều khiển', path: '/supplier', icon: <i className="fas fa-tachometer-alt w-6"></i> },
    { name: 'Tạo phiếu nhập', path: '/supplier/create-submission', icon: <i className="fas fa-plus w-6"></i> },
    { name: 'Phiếu của tôi', path: '/supplier/my-submissions', icon: <i className="fas fa-list w-6"></i> },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Supplier Panel
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/supplier'} // Dành cho Bảng điều khiển
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg hover:bg-gray-700 ${
                isActive ? 'bg-blue-600' : ''
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

export default SupplierSidebar;