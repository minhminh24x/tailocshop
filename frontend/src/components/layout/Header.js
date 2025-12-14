import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Menu, X, ShoppingCart, User, LogOut, Sparkles, ChevronDown, Settings, HelpCircle, Shield, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // [SỬA] Chỉ 3 menu items
  const menuItems = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Sản Phẩm', path: '/items' },
    { name: 'Chúng Tôi', path: '/about' },
  ];

  // Style cho link active và thường
  const baseLinkStyle = "text-sm font-bold uppercase tracking-widest transition-all duration-300 px-3 py-2 rounded-lg relative group overflow-hidden";
  const activeLinkStyle = "text-yellow-400 bg-white/5 shadow-[0_0_15px_rgba(250,204,21,0.3)]";
  const normalLinkStyle = "text-gray-300 hover:text-white hover:bg-white/5";

  // [SỬA] Dropdown menu items - Xóa Yêu thích, đổi Hỗ trợ thành Liên hệ
  const getDropdownItems = () => {
    const items = [
      { name: 'Thông tin', path: '/profile', icon: User },
      { name: 'Đơn hàng', path: '/my-orders', icon: Package },
      { name: 'Liên hệ', path: '/contact', icon: HelpCircle },
    ];

    // Thêm link admin/staff nếu có quyền
    if (user?.role === 'ADMIN') {
      items.unshift({ name: 'Quản trị Admin', path: '/admin', icon: Shield });
    } else if (user?.role === 'STAFF') {
      items.unshift({ name: 'Trang Staff', path: '/staff', icon: Settings });
    } else if (user?.role === 'SUPPLIER') {
      items.unshift({ name: 'Nhà cung cấp', path: '/supplier', icon: Package });
    }

    return items;
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-2 shadow-2xl'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-2 bg-yellow-500/30 rounded-full blur-lg group-hover:bg-yellow-500/50 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-black p-2.5 rounded-xl border border-yellow-500/30 group-hover:border-yellow-400 transition-all">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-lg">
              Tài Lộc <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">Shop</span>
            </span>
            <span className="text-[10px] text-gray-400 tracking-[0.2em] font-medium group-hover:text-yellow-200 transition-colors">
              PREMIUM STORE
            </span>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-2 bg-black/20 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${baseLinkStyle} ${location.pathname === item.path ? activeLinkStyle : normalLinkStyle}`}
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-5">
          {/* Cart Icon */}
          <Link to="/cart" className="relative group p-2">
            <ShoppingCart className="w-6 h-6 text-gray-300 group-hover:text-yellow-400 transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-slate-900">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* [SỬA] Avatar + Dropdown Trigger */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-4 border-l border-white/10 group"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {user.role === 'ADMIN' ? 'Admin' : user.role === 'STAFF' ? 'Staff' : 'Player'}
                  </p>
                  <p className="text-sm font-bold text-yellow-400 truncate max-w-[120px] drop-shadow-md">{user.inGameName}</p>
                </div>
                <div className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-yellow-500/50 transition-all">
                  <User className="w-5 h-5 text-blue-300" />
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* [SỬA] Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-transparent">
                      <p className="text-sm font-bold text-white">{user.inGameName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="py-2">
                      {getDropdownItems().map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-white/10 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors px-4">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-slate-900 font-extrabold py-2.5 px-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 hover:text-yellow-400 font-medium border border-transparent hover:border-white/10"
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile - User options */}
              {user ? (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <p className="text-sm font-bold text-yellow-400 px-4">{user.inGameName}</p>
                  {getDropdownItems().map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-900/30 text-red-400 hover:bg-red-900/50"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 rounded-xl bg-slate-800 text-white font-bold border border-slate-700">Đăng nhập</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 rounded-xl bg-yellow-500 text-slate-900 font-bold">Đăng ký</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}