import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaGem, FaCoins, FaEye, FaEyeSlash, FaCheck, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { changePassword } from '../services/userService';

/**
 * Hàm trợ giúp để lấy URL hình ảnh VIP.
 */
const getVipImageUrl = (vipLevel) => {
  if (vipLevel?.imageUrl) {
    return vipLevel.imageUrl;
  }

  let imageUrl = '/images/vip/default-badge.png';

  if (!vipLevel) {
    return imageUrl;
  }

  switch (vipLevel.name?.toLowerCase()) {
    case 'đồng':
      imageUrl = '/images/vip/dong.png';
      break;
    case 'bạc':
      imageUrl = '/images/vip/bac.png';
      break;
    case 'vàng':
      imageUrl = '/images/vip/vang.png';
      break;
    case 'kim cương':
      imageUrl = '/images/vip/kimcuong.png';
      break;
    default:
      break;
  }

  return imageUrl;
};

/**
 * [THÊM] Component hiển thị yêu cầu mật khẩu
 */
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: 'Ít nhất 8 ký tự', test: (pw) => pw.length >= 8 },
    { label: 'Có chữ HOA (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'Có chữ thường (a-z)', test: (pw) => /[a-z]/.test(pw) },
    { label: 'Có số (0-9)', test: (pw) => /[0-9]/.test(pw) },
    { label: 'Có ký tự đặc biệt (!@#$%...)', test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
  ];

  return (
    <div className="mt-3 p-4 bg-slate-900/50 rounded-xl border border-white/10">
      <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <FaShieldAlt className="text-yellow-400" />
        Yêu cầu mật khẩu mạnh:
      </p>
      <ul className="space-y-2">
        {requirements.map((req, idx) => {
          const passed = password ? req.test(password) : false;
          return (
            <li
              key={idx}
              className={`flex items-center gap-2 text-sm ${passed ? 'text-green-400' : 'text-gray-500'}`}
            >
              {passed ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const UserProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const nextVip = useAuthStore((state) => state.nextVipLevel);

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    // [THÊM] Validate mật khẩu mạnh trước khi gửi
    const passwordErrors = [];
    if (newPassword.length < 8) passwordErrors.push('Ít nhất 8 ký tự');
    if (!/[A-Z]/.test(newPassword)) passwordErrors.push('Cần chữ HOA');
    if (!/[a-z]/.test(newPassword)) passwordErrors.push('Cần chữ thường');
    if (!/[0-9]/.test(newPassword)) passwordErrors.push('Cần số');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) passwordErrors.push('Cần ký tự đặc biệt');

    if (passwordErrors.length > 0) {
      toast.error(`Mật khẩu yếu: ${passwordErrors.join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const currentVip = user.vipLevel;
  const totalCoins = parseFloat(user.totalCoinSpent) || 0;
  const vipImageUrl = getVipImageUrl(currentVip);

  const nextVipThreshold = nextVip?.minTotalSpent || 1000000;
  const progressPercent = nextVip
    ? Math.min(100, (totalCoins / parseFloat(nextVipThreshold)) * 100)
    : 100;

  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'STAFF': return 'Nhân viên';
      case 'SUPPLIER': return 'Nhà cung cấp';
      case 'CUSTOMER': return 'Khách hàng';
      default: return role;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Hồ Sơ Của Bạn</h1>

      {/* [SỬA] Thông tin tài khoản - DARK THEME */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Thông tin tài khoản</h2>
          <div className="space-y-3 text-gray-300">
            <p><strong className="text-gray-400">Tên trong game:</strong> <span className="text-yellow-400 font-medium">{user.inGameName}</span></p>
            <p><strong className="text-gray-400">Email:</strong> {user.email}</p>
            <p><strong className="text-gray-400">Ngày tham gia:</strong> {formatDate(user.createdAt)}</p>
            <p><strong className="text-gray-400">Vai trò:</strong>
              <span className={`ml-2 px-2 py-1 text-xs font-bold rounded ${user.role === 'ADMIN' ? 'bg-red-600/30 text-red-300' :
                user.role === 'STAFF' ? 'bg-blue-600/30 text-blue-300' :
                  user.role === 'SUPPLIER' ? 'bg-green-600/30 text-green-300' :
                    'bg-gray-600/30 text-gray-300'
                }`}>
                {getRoleName(user.role)}
              </span>
            </p>
          </div>

          {/* Quick link cho Admin/Staff */}
          {(user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'SUPPLIER') && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff' : '/supplier'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-lg transition-colors"
              >
                Đi đến Dashboard {user.role}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* [SỬA] Cấp độ VIP - DARK THEME */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaGem className="text-blue-400" /> Cấp độ VIP
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Hình ảnh VIP */}
            <div className="text-center flex-shrink-0">
              <div className="w-24 h-24 mx-auto mb-2 rounded-full border-4 border-blue-500/50 overflow-hidden bg-slate-800">
                <img
                  src={vipImageUrl}
                  alt={currentVip?.name || 'Chưa có VIP'}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-lg font-bold text-blue-400">
                {currentVip ? `VIP ${currentVip.name}` : 'Thành viên mới'}
              </p>
            </div>

            {/* Tiến trình VIP */}
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-300">Tiến trình lên cấp</h3>

              <div className="flex justify-between items-center my-3">
                <span className="flex items-center text-gray-400">
                  <FaCoins className="mr-2 text-yellow-500" />
                  Tổng Xu đã nạp:
                </span>
                <span className="font-bold text-lg text-yellow-400">{totalCoins.toLocaleString('vi-VN')} Xu</span>
              </div>

              {/* Thanh tiến trình */}
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {nextVip ? (
                <p className="text-sm text-gray-400 mt-2">
                  Cần thêm <strong className="text-yellow-400">{(parseFloat(nextVipThreshold) - totalCoins).toLocaleString('vi-VN')} Xu</strong> để đạt <strong className="text-blue-400">{nextVip.name}</strong>
                </p>
              ) : (
                <p className="text-sm text-green-400 mt-2">🎉 Bạn đã đạt cấp VIP cao nhất!</p>
              )}

              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-white/10">
                <p className="text-sm font-semibold text-gray-300 mb-1">Lợi ích cấp hiện tại:</p>
                {currentVip ? (
                  <p className="text-sm text-green-400">
                    Giảm {currentVip.discountPercent}% trên mọi đơn hàng!
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Hãy mua sắm để tích lũy và nhận những lợi ích đầu tiên!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* [SỬA] Đổi Mật Khẩu - DARK THEME + PASSWORD REQUIREMENTS */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Đổi Mật Khẩu</h2>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {/* Mật khẩu cũ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="currentPassword">
                Mật khẩu cũ
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPass.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
                >
                  {showPass.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPass.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
                >
                  {showPass.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* [THÊM] Hiển thị yêu cầu mật khẩu */}
              <PasswordRequirements password={passwordData.newPassword} />
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="confirmNewPassword">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type={showPass.confirm ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
                >
                  {showPass.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {/* Match indicator */}
              {passwordData.confirmNewPassword && (
                <p className={`text-sm mt-2 ${passwordData.newPassword === passwordData.confirmNewPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {passwordData.newPassword === passwordData.confirmNewPassword
                    ? '✓ Mật khẩu khớp'
                    : '✗ Mật khẩu không khớp'}
                </p>
              )}
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;