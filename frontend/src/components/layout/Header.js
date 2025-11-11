// File: frontend/src/components/layout/Header.js
import React, { useState, useRef, useEffect } from 'react'; // Thêm useState, useRef, useEffect
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

// Thêm icon cho dropdown
import { User, LifeBuoy, LogOut, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Thêm state và ref cho dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate(); // Dùng để điều hướng sau khi logout

  const totalItemCount = cartItems.reduce((total, entry) => total + entry.quantity, 0);

  const handleLogout = () => {
    logout();
    clearCart();
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false); // Đóng dropdown khi logout
    navigate('/login'); // Chuyển về trang login
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Thêm useEffect để đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const renderNavLinks = (isMobile = false) => (
    <>
      <NavLink
        to="/"
        className={isMobile ? getMobileNavLinkClass : getDesktopNavLinkClass}
        onClick={closeMobileMenu}
      >
        Trang chủ
      </NavLink>
      <NavLink
        to="/items"
        className={isMobile ? getMobileNavLinkClass : getDesktopNavLinkClass}
        onClick={closeMobileMenu}
      >
        Sản phẩm
      </NavLink>
      {user && (
        <NavLink
          to="/my-orders"
          className={isMobile ? getMobileNavLinkClass : getDesktopNavLinkClass}
          onClick={closeMobileMenu}
        >
          Đơn hàng
        </NavLink>
      )}
      {user && user.role === 'ADMIN' && (
        <NavLink
          // [SỬA] Đổi link admin cho đúng với App.js của bạn
          to="/admin" 
          className={isMobile ? getMobileNavLinkClass : getDesktopNavLinkClass}
          onClick={closeMobileMenu}
        >
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-3xl font-extrabold text-pink-500 hover:text-pink-400 transition-colors" onClick={closeMobileMenu}>
          Tài Lộc Shop
        </Link>

        {/* Nút Hamburger (Mobile) */}
        <div className="md:hidden flex items-center space-x-4">
          <CartIconLink totalItemCount={totalItemCount} onClick={closeMobileMenu} />
          <button onClick={toggleMobileMenu} className="text-gray-300 hover:text-white focus:outline-none">
            {/* (Icon SVG) */}
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
          {renderNavLinks(false)}
          
          <CartIconLink totalItemCount={totalItemCount} onClick={closeMobileMenu} />

          {user ? (
            // --- [THAY ĐỔI] Thay thế phần "Xin chào" và "Đăng xuất" bằng Dropdown ---
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-green-400 font-medium hover:text-green-300 focus:outline-none"
                title="Tài khoản"
              >
                <User size={18} />
                <span className="hidden sm:inline">Xin chào, {user.inGameName}!</span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-20">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <User size={16} className="mr-2" />
                    Hồ Sơ
                  </Link>
                  <Link
                    to="/support"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <LifeBuoy size={16} className="mr-2" />
                    Hỗ trợ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Đăng Xuất
                  </button>
                </div>
              )}
            </div>
            // --- [KẾT THÚC THAY ĐỔI] ---

          ) : (
            <div className="flex items-center space-x-3 ml-4">
              <NavLink to="/login" className={getDesktopAuthLinkClass} onClick={closeMobileMenu}>Đăng nhập</NavLink>
              <NavLink to="/register" className={getDesktopAuthLinkClass} onClick={closeMobileMenu}>Đăng ký</NavLink>
            </div>
          )}
          
        </nav>
      </div>

      {/* Mobile Menu (Ẩn/Hiện) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 pb-4 animate-fade-in-down">
          <nav className="flex flex-col items-center space-y-3 px-4">
            {renderNavLinks(true)}

            {user ? (
              <>
                <span className="text-green-400 font-medium text-lg pt-2">Xin chào, {user.inGameName}!</span>
                
                {/* --- [THÊM MỚI] Links cho Profile và Support trên Mobile --- */}
                {/* Trên mobile, chúng ta hiển thị link trực tiếp thay vì dropdown lồng nhau */}
                <NavLink 
                  to="/profile" 
                  className={getMobileNavLinkClass} 
                  onClick={closeMobileMenu}
                >
                  <User size={16} className="inline mr-2" />
                  Hồ Sơ
                </NavLink>
                <NavLink 
                  to="/support" 
                  className={getMobileNavLinkClass} 
                  onClick={closeMobileMenu}
                >
                  <LifeBuoy size={16} className="inline mr-2" />
                  Hỗ Trợ
                </NavLink>
                {/* --- [KẾT THÚC THÊM MỚI] --- */}

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full w-full mt-2" // Thêm mt-2
                >
                  <LogOut size={16} className="inline mr-2" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={getMobileAuthLinkClass} onClick={closeMobileMenu}>Đăng nhập</NavLink>
                <NavLink to="/register" className={getMobileAuthLinkClass} onClick={closeMobileMenu}>Đăng ký</NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// (Các helper component và class names giữ nguyên như cũ)
// ...
// Component Icon Cart (Req 4)
const CartIconLink = ({ totalItemCount, onClick }) => (
  <NavLink
    to="/cart"
    // [SỬA ĐỔI] Thêm `ml-4` để tạo khoảng cách với nav links
    className={({ isActive }) => `relative text-gray-300 hover:text-white transition-colors md:ml-4 ${isActive ? 'text-pink-500' : ''}`} // Thêm md:ml-4
    onClick={onClick}
    title="Giỏ hàng"
  >
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    {totalItemCount > 0 && (
      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
        {totalItemCount}
      </span>
    )}
  </NavLink>
);

// Style cho NavLink (Desktop)
const getDesktopNavLinkClass = ({ isActive }) =>
  `nav-link text-gray-300 hover:text-white transition-colors ${isActive ? 'text-pink-500 font-bold' : ''}`;

// Style cho NavLink (Mobile)
const getMobileNavLinkClass = ({ isActive }) =>
  `text-lg w-full text-center py-2 border-b border-gray-700 ${isActive ? 'text-pink-500 font-bold' : 'text-gray-300 hover:text-white'}`;

// Style cho Nút Đăng nhập/Đăng ký (Desktop)
const getDesktopAuthLinkClass = ({ isActive }) =>
  `bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-bold text-white transition-all ${isActive ? 'ring-2 ring-blue-400' : ''}`;

// Style cho Nút Đăng nhập/Đăng ký (Mobile)
const getMobileAuthLinkClass = ({ isActive }) =>
  `bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold text-white w-full text-center ${isActive ? 'ring-2 ring-blue-400' : ''}`;