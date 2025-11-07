// File: frontend/src/pages/admin/AdminDashboard.js
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Tổng quan</h1>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <p className="text-lg text-gray-300">
          Chào mừng bạn đến với trang quản trị của Tài Lộc Shop.
        </p>
        <p className="mt-4 text-gray-400">
          Sử dụng thanh điều hướng bên trái để bắt đầu quản lý đơn hàng, vật phẩm, và nhiều hơn nữa.
        </p>
      </div>
    </div>
  );
}