import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaGem, FaCoins, FaEye, FaEyeSlash } from 'react-icons/fa';
// Giả định bạn có service để gọi API đổi mật khẩu
import { changePassword } from '../services/userService'; 

/**
 * Hàm trợ giúp để lấy URL hình ảnh VIP.
 * Giả định bạn có các ảnh trong /public/images/vip/
 */
const getVipImageUrl = (vipLevel) => {
  // 1. [SỬA] Dùng "optional chaining" (dấu ?.)
  //    Nếu vipLevel tồn tại VÀ có imageUrl, trả về nó ngay
  if (vipLevel?.imageUrl) {
    return vipLevel.imageUrl;
  }

  let imageUrl = '/images/vip/default-badge.png'; // Ảnh mặc định

  // 2. [SỬA] Nếu vipLevel là null hoặc undefined,
  //    trả về ảnh mặc định ngay lập tức
  if (!vipLevel) {
    return imageUrl;
  }

  // 3. Nếu vipLevel tồn tại (nhưng không có imageUrl),
  //    mới chạy switch (đã sửa lỗi Eslint)
  switch (vipLevel.name.toLowerCase()) {
    case 'đồng':
      // 
      imageUrl = '/images/vip/dong.png';
      break;
    case 'bạc':
      // 
      imageUrl = '/images/vip/bac.png';
      break;
    case 'vàng':
      // 
      imageUrl = '/images/vip/vang.png';
      break;
    case 'kim cương':
      // 
      imageUrl = '/images/vip/kimcuong.png';
      break;
    default:
      // Giữ ảnh mặc định đã set ở trên
      break;
  }
  
  return imageUrl;
};

const UserProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const nextVip = useAuthStore((state) => state.nextVipLevel);
  // State cho Form Đổi Mật Khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Thông thường, trang này sẽ được bảo vệ bởi UserProtectedRoute
  // nhưng chúng ta vẫn kiểm tra user ở đây để đề phòng
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // --- Xử lý Form Đổi Mật Khẩu ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API service (cần import)
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success(response.message || 'Đổi mật khẩu thành công!');
      // Xóa form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      toast.error(error.response?.data?.message || 'Lỗi: Không thể đổi mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Chuẩn bị dữ liệu cho VIP ---
  // Giả định 'user' từ authStore có các trường này
  const totalCoins = user.totalCoinPurchased || 0;
  const currentVip = user.vipLevel; // VD: { name: 'Bạc', description: '...' }
  

  const vipImageUrl = getVipImageUrl(currentVip);

  let progressPercent = 0;
  let progressText = `${totalCoins} Xu`;

  if (nextVip && nextVip.requiredCoins > 0) {
    // Tính toán tiến trình
    progressPercent = Math.min((totalCoins / nextVip.requiredCoins) * 100, 100);
    progressText = `${totalCoins} / ${nextVip.requiredCoins} Xu`;
  } else if (currentVip) {
    // Đã đạt cấp tối đa
    progressPercent = 100;
    progressText = "Đã đạt cấp cao nhất";
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hồ Sơ Của Bạn</h1>

      {/* Thông tin tài khoản (Giữ nguyên) */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Thông tin tài khoản</h2>
          <div className="space-y-3">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Tên trong game:</strong> {user.inGameName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Ngày tham gia:</strong> {formatDate(user.createdAt)}</p>
            <p><strong>Vai trò:</strong> {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}</p>
          </div>
        </div>
      </div>

      {/* Cấp độ VIP (Hoàn thiện) */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaGem className="mr-3 text-blue-500" /> Cấp độ VIP
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Hình ảnh VIP */}
            <div className="text-center flex-shrink-0">
              <img 
                src={vipImageUrl} 
                alt={currentVip?.name || 'Chưa có VIP'} 
                className="w-28 h-28 mx-auto mb-2 rounded-full border-4 border-blue-200 object-cover" 
              />
              <p className="text-xl font-bold text-blue-600">
                {currentVip ? `VIP ${currentVip.name}` : 'Thành viên mới'}
              </p>
            </div>
            
            {/* Tiến trình VIP */}
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-700">Tiến trình lên cấp</h3>
              
              <div className="flex justify-between items-center my-2 text-gray-600">
                <span className="flex items-center">
                  <FaCoins className="mr-2 text-yellow-500" />
                  Tổng Xu đã nạp:
                </span>
                <span className="font-bold text-lg text-gray-800">{totalCoins.toLocaleString('vi-VN')} Xu</span>
              </div>

              {/* Thanh tiến trình */}
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden mt-2 relative">
                <div 
                  className="bg-blue-500 h-5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                >
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white mix-blend-difference px-2">
                  {progressText}
                </span>
              </div>
              
              {nextVip ? (
                <p className="text-right text-sm text-gray-500 mt-1">
                  Còn {Math.max(0, nextVip.requiredCoins - totalCoins).toLocaleString('vi-VN')} Xu nữa để lên {nextVip.name}
                </p>
              ) : (
                currentVip && (
                  <p className="text-right text-sm text-green-600 font-semibold mt-1">
                    Bạn đã đạt cấp VIP cao nhất!
                  </p>
                )
              )}

              {/* Lợi ích */}
              <div className="mt-4">
                 <h4 className="font-semibold text-gray-700">Lợi ích cấp {currentVip?.name}:</h4>
                 <p className="text-gray-500 text-sm">
                   {currentVip?.description || "Hãy nạp xu để nhận những lợi ích đầu tiên!"}
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Đổi Mật Khẩu (Hoàn thiện) */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Đổi Mật Khẩu</h2>
          
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {/* Mật khẩu cũ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
                Mật khẩu cũ
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPass.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({...p, current: !p.current}))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPass.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                Mật khẩu mới (Ít nhất 6 ký tự)
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPass.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({...p, new: !p.new}))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPass.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmNewPassword">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type={showPass.confirm ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({...p, confirm: !p.confirm}))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPass.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Nút Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;