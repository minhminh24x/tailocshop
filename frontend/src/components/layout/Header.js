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
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Sản Phẩm', path: '/items' },
    { name: 'Hỗ Trợ', path: '/support' },
  ];

  // Style cho link active và thường
  const baseLinkStyle = "text-sm font-bold uppercase tracking-widest transition-all duration-300 px-3 py-2 rounded-lg relative group overflow-hidden";
  const activeLinkStyle = "text-yellow-400 bg-white/5 shadow-[0_0_15px_rgba(250,204,21,0.3)]";
  const normalLinkStyle = "text-gray-300 hover:text-white hover:bg-white/5";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
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
              {/* Hiệu ứng hover gạch chân chạy */}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/cart" className="relative group p-2">
            <ShoppingCart className="w-6 h-6 text-gray-300 group-hover:text-yellow-400 transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-slate-900">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-5 border-l border-white/10">
              <div className="text-right hidden lg:block">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Player</p>
                <p className="text-sm font-bold text-yellow-400 truncate max-w-[120px] drop-shadow-md">{user.inGameName}</p>
              </div>
              <Link to="/profile" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-yellow-500/50 transition-all">
                <User className="w-5 h-5 text-blue-300" />
              </Link>
              <button onClick={logout} className="p-2 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
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
               {/* Mobile Auth */}
               {!user && (
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