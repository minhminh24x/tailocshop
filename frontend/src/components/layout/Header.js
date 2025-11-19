import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Menu, X, ShoppingCart, User, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // [ĐÃ SỬA] Xóa mục "Nạp Tiền"
  const menuItems = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Sản Phẩm', path: '/items' },
    // { name: 'Nạp Tiền', path: '/deposit' }, <-- Đã xóa
    { name: 'Hỗ Trợ', path: '/support' },
  ];

  const activeLinkStyle = "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
  const normalLinkStyle = "text-gray-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 py-3 shadow-lg' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-black p-2 rounded-full border border-yellow-500/50">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 drop-shadow-sm">
            Tài Lộc <span className="text-white font-light">Shop</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm uppercase tracking-wider ${
                location.pathname === item.path ? activeLinkStyle : normalLinkStyle
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-gray-300 hover:text-yellow-400 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg animate-bounce">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div className="text-right hidden lg:block">
                <p className="text-xs text-gray-400">Chào,</p>
                <p className="text-sm font-bold text-yellow-400 max-w-[100px] truncate">{user.inGameName}</p>
              </div>
              <Link to="/profile" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-all">
                <User className="w-5 h-5 text-blue-400" />
              </Link>
              <button onClick={logout} className="p-2 hover:text-red-400 transition-colors" title="Đăng xuất">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold py-2 px-5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className="md:hidden p-2 text-gray-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE NAV DROPDOWN */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-700">
                 {!user ? (
                   <div className="grid grid-cols-2 gap-4">
                     <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 rounded-lg bg-slate-800 text-white">Đăng nhập</Link>
                     <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 rounded-lg bg-yellow-500 text-black font-bold">Đăng ký</Link>
                   </div>
                 ) : (
                   <button onClick={() => {logout(); setIsMobileMenuOpen(false)}} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50">
                     <LogOut className="w-4 h-4" /> Đăng xuất
                   </button>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}