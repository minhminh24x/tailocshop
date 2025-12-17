// File: frontend/src/pages/staff/StaffHeader.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Settings, Lock, LogOut, User, ChevronDown, Bell, Home } from 'lucide-react';

export default function StaffHeader() {
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
        navigate('/staff/login');
    };

    return (
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-white/10">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
                <Link
                    to="/staff/dashboard"
                    className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                    🛒 Staff Panel
                </Link>
                <span className="text-xs text-gray-500 hidden md:inline">Tài Lộc Shop</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                {/* Quick link to Shop */}
                <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                    <Home className="w-4 h-4" />
                    <span className="hidden md:inline">Về Shop</span>
                </Link>

                {/* Notifications (placeholder) */}
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                    {/* Badge */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-white">{user?.inGameName || 'Staff'}</p>
                            <p className="text-xs text-gray-400">{user?.role || 'STAFF'}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-xl border border-white/10 shadow-xl overflow-hidden">
                            {/* User Info Card */}
                            {user && (
                                <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.inGameName}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Menu Items */}
                            <div className="py-2">
                                <Link
                                    to="/change-password"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <Lock className="w-4 h-4" />
                                    Đổi mật khẩu
                                </Link>

                                <Link
                                    to="/staff/dashboard"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Cài đặt
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-white/10 py-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
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
