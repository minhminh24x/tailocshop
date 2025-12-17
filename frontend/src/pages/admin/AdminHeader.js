// File: frontend/src/pages/admin/AdminHeader.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Settings, Lock, LogOut, User, ChevronDown } from 'lucide-react';

export default function AdminHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <Link to="/admin" className="text-xl font-bold text-pink-500 hover:text-pink-400 transition-colors">
        Tài Lộc Shop - Admin Panel
      </Link>

      <div className="flex items-center space-x-4">
        {/* [SỬA] Dropdown Cài đặt thay vì Về Shop */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl border border-white/10 shadow-xl overflow-hidden">
              {/* User Info */}
              {user && (
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.inGameName}</p>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/change-password"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Đổi mật khẩu
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}