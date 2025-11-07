// src/components/layout/Header.js
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js'; // Import auth store

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); // Đóng menu sau khi đăng xuất
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Tên Shop */}
        <Link to="/" className="text-3xl font-extrabold text-pink-500 hover:text-pink-400 transition-colors duration-300" onClick={closeMobileMenu}>
          Tài Lộc Shop
        </Link>

        {/* Nút Hamburger cho Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-gray-300 hover:text-white focus:outline-none">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu chính (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'text-pink-500' : 'text-gray-300 hover:text-white'}`} onClick={closeMobileMenu}>Trang chủ</NavLink>
          {/* Ví dụ thêm link sản phẩm */}
          <NavLink to="/items" className={({isActive}) => `nav-link ${isActive ? 'text-pink-500' : 'text-gray-300 hover:text-white'}`} onClick={closeMobileMenu}>Sản phẩm</NavLink>
          
          {user && user.isAdmin && (
            <NavLink to="/admin/dashboard" className={({isActive}) => `nav-link ${isActive ? 'text-pink-500' : 'text-gray-300 hover:text-white'}`} onClick={closeMobileMenu}>Admin</NavLink>
          )}

          {user ? (
            <div className="flex items-center space-x-3 ml-4">
              <span className="text-green-400 font-medium">Xin chào, {user.inGameName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 shadow-md"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 ml-4">
              <NavLink to="/login" className={({isActive}) => `nav-link bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-md ${isActive ? 'ring-2 ring-blue-400' : ''}`} onClick={closeMobileMenu}>Đăng nhập</NavLink>
              <NavLink to="/register" className={({isActive}) => `nav-link bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-md ${isActive ? 'ring-2 ring-green-400' : ''}`} onClick={closeMobileMenu}>Đăng ký</NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Menu (Ẩn/Hiện) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 pb-4 animate-fade-in-down">
          <nav className="flex flex-col items-center space-y-4 px-4">
            <NavLink to="/" className="text-gray-300 hover:text-white text-lg w-full text-center py-2 border-b border-gray-700" onClick={closeMobileMenu}>Trang chủ</NavLink>
            <NavLink to="/items" className="text-gray-300 hover:text-white text-lg w-full text-center py-2 border-b border-gray-700" onClick={closeMobileMenu}>Sản phẩm</NavLink>
            
            {user && user.isAdmin && (
              <NavLink to="/admin/dashboard" className="text-gray-300 hover:text-white text-lg w-full text-center py-2 border-b border-gray-700" onClick={closeMobileMenu}>Admin</NavLink>
            )}

            {user ? (
              <>
                <span className="text-green-400 font-medium text-lg pt-2">Xin chào, {user.inGameName}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-md w-full"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold text-white w-full text-center transition-all duration-300 shadow-md" onClick={closeMobileMenu}>Đăng nhập</NavLink>
                <NavLink to="/register" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold text-white w-full text-center transition-all duration-300 shadow-md" onClick={closeMobileMenu}>Đăng ký</NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}