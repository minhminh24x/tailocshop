// src/App.js
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import AdminDashboard from './pages/AdminDashboard.js';

// 1. Import store
import { useAuthStore } from './store/authStore.js';
import { shallow } from 'zustand/shallow';

function App() {
  // 2. Lấy user và hàm logout từ store
 const { user, logout } = useAuthStore(
    (state) => ({
      user: state.user,
      logout: state.logout,
    }),
    shallow // <-- THÊM VÀO
  );
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* 3. Cập nhật Navbar */}
      <nav className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">Trang chủ</Link>
          <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">Admin</Link>
        </div>
        
        <div className="flex gap-4 items-center">
          {user ? (
            // Nếu ĐÃ đăng nhập
            <>
              <span className="text-green-400">Chào, {user.inGameName}!</span>
              <button
                onClick={logout} // Gọi hàm logout từ store
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            // Nếu CHƯA đăng nhập
            <>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Đăng nhập</Link>
              <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Đăng ký</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hệ thống Route (không đổi) */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;