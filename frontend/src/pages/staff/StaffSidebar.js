// File: frontend/src/pages/staff/StaffSidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Home, ShoppingCart, Package, User, LogOut, Settings,
  Clock, CheckCircle, Truck, BarChart3
} from 'lucide-react';

const StaffSidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  // Menu items cho Staff
  const menuItems = [
    {
      name: 'Tổng quan',
      path: '/staff/dashboard',
      icon: <Home className="w-5 h-5" />,
      description: 'Xem thống kê chung'
    },
    {
      name: 'Tất cả đơn hàng',
      path: '/staff/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Quản lý đơn hàng'
    },
    {
      name: 'Đơn chờ xử lý',
      path: '/staff/orders?status=PENDING',
      icon: <Clock className="w-5 h-5" />,
      badge: 'pending',
      badgeColor: 'bg-yellow-500'
    },
    {
      name: 'Đang chuẩn bị',
      path: '/staff/orders?status=PREPARING',
      icon: <Package className="w-5 h-5" />,
      badge: 'preparing',
      badgeColor: 'bg-blue-500'
    },
    {
      name: 'Sẵn sàng giao',
      path: '/staff/orders?status=READY_FOR_DELIVERY',
      icon: <Truck className="w-5 h-5" />,
      badge: 'ready',
      badgeColor: 'bg-green-500'
    },
    {
      name: 'Đã hoàn thành',
      path: '/staff/orders?status=COMPLETED',
      icon: <CheckCircle className="w-5 h-5" />,
      badgeColor: 'bg-emerald-500'
    },
  ];

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group";
    const activeClasses = "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25";
    const inactiveClasses = "text-gray-400 hover:bg-white/5 hover:text-white";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-white/10 shrink-0">
      {/* Logo Section */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Staff Panel
            </h1>
            <p className="text-xs text-gray-500">Quản lý đơn hàng</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.inGameName || 'Staff'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'staff@tailocshop.com'}
            </p>
          </div>
          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
            {user?.role || 'STAFF'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-3">Menu chính</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={getNavLinkClass}
          >
            <span className="text-current">{item.icon}</span>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className={`px-2 py-0.5 text-xs ${item.badgeColor} text-white rounded-full`}>
                •
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <NavLink
          to="/change-password"
          className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Đổi mật khẩu</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;