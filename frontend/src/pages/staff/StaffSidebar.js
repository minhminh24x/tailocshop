// File: frontend/src/pages/staff/StaffSidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, ShoppingCart, Package, User, LogOut, Settings, Truck } from 'lucide-react';

const StaffSidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  // Menu items dựa trên role
  const getMenuItems = () => {
    const baseItems = [
      { name: 'Tổng quan', path: '/staff/dashboard', icon: <Home className="w-5 h-5" /> },
      { name: 'Đơn hàng', path: '/staff/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    ];

    // Thêm các menu đặc biệt cho từng role
    if (user?.role === 'SUPPLIER') {
      return [
        { name: 'Tổng quan', path: '/supplier/dashboard', icon: <Home className="w-5 h-5" /> },
        { name: 'Nhập hàng', path: '/supplier/submit', icon: <Package className="w-5 h-5" /> },
        { name: 'Lịch sử nhập', path: '/supplier/history', icon: <Truck className="w-5 h-5" /> },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-xl transition-all duration-200";
    const activeClasses = "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg";
    const inactiveClasses = "text-gray-300 hover:bg-white/10 hover:text-white";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col border-r border-white/10">
      {/* Logo / Title */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {user?.role === 'SUPPLIER' ? 'Supplier Panel' : 'Staff Panel'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">Tài Lộc Shop</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.inGameName || 'Staff'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.role || 'STAFF'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={getNavLinkClass}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <NavLink
          to="/change-password"
          className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Đổi mật khẩu</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;