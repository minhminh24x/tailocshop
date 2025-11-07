// src/App.js
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import AdminDashboard from './pages/AdminDashboard.js';

// [KHÔI PHỤC] Import useAuthStore
import { useAuthStore } from './store/authStore.js';
// [XÓA] Xóa 'shallow' vì chúng ta không dùng nữa
// import { shallow } from 'zustand/shallow';
import WarningModal from './components/WarningModal.js';

function App() {
  
  // [ĐÃ SỬA] Tách riêng 2 hook để tránh vòng lặp render
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      <WarningModal />

      <nav className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">Trang chủ</Link>
        </div>
          
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-green-400">Chào, {user.inGameName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Đăng xuất
              </button>
            </>
          ) : (
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