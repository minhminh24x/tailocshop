// src/App.js
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import AdminDashboard from './pages/AdminDashboard.js';

// [ĐÃ XÓA] Xóa import useAuthStore và shallow
// import { useAuthStore } from './store/authStore.js';
// import { shallow } from 'zustand/shallow';

function App() {
  
  // [ĐÃ XÓA] Toàn bộ logic gọi useAuthStore
  // const { user, logout } = useAuthStore(...)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* 3. Cập nhật Navbar */}
      <nav className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">Trang chủ</Link>
          <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">Admin</Link>
        </div>
        
        <div className="flex gap-4 items-center">
          { /* [ĐÃ SỬA] Hiển thị cố định trạng thái "chưa đăng nhập" */ }
          <>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Đăng nhập</Link>
            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Đăng ký</Link>
          </>
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