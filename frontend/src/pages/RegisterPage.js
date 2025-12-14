// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import apiClient from '../services/apiClient.js';
import { toast } from 'react-hot-toast';
import { Mail, Key, User, Shield, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inGameName, setInGameName] = useState('');
  const [otp, setOtp] = useState('');

  // Step control (1 = info, 2 = OTP, 3 = success)
  const [step, setStep] = useState(1);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const navigate = useNavigate();

  // Bước 1: Gửi OTP đến email
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email || !inGameName) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setOtpSending(true);
    try {
      await apiClient.post('/auth/send-otp', { email, inGameName });
      toast.success('Mã OTP đã được gửi đến email của bạn!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setOtpVerifying(true);
    try {
      await apiClient.post('/auth/verify-otp', { email, otp });
      toast.success('Xác thực thành công!');
      setEmailVerified(true);
      setStep(3); // Chuyển sang bước đặt mật khẩu và hoàn tất
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP không đúng');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Bước 3: Hoàn tất đăng ký
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const success = await register({ email, password, inGameName });

    if (success) {
      toast.success('Đăng ký thành công!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    setOtpSending(true);
    try {
      await apiClient.post('/auth/send-otp', { email, inGameName });
      toast.success('Đã gửi lại mã OTP!');
    } catch (err) {
      toast.error('Không thể gửi lại OTP');
    } finally {
      setOtpSending(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-white/10">

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-purple-600' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Nhập thông tin và gửi OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-white mb-4">Đăng Ký</h2>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-bold mb-2">
                <User className="w-4 h-4" />
                Tên trong game
              </label>
              <input
                type="text"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nhập tên nhân vật Minecraft"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-bold mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="email@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Mã xác thực sẽ được gửi đến email này</p>
            </div>

            <button
              type="submit"
              disabled={otpSending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-500"
            >
              {otpSending ? 'Đang gửi...' : (
                <>
                  Tiếp tục <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-400 hover:underline">Đăng nhập</Link>
            </p>
          </form>
        )}

        {/* Step 2: Xác thực OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Xác Thực Email</h2>
              <p className="text-gray-400 text-sm">
                Chúng tôi đã gửi mã 6 số đến<br />
                <strong className="text-white">{email}</strong>
              </p>
            </div>

            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={otpVerifying || otp.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:bg-gray-500"
            >
              {otpVerifying ? 'Đang xác thực...' : 'Xác nhận'}
            </button>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={otpSending}
                className="text-purple-400 hover:text-purple-300"
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Đặt mật khẩu và hoàn tất */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Đã Xác Thực!</h2>
              <p className="text-gray-400 text-sm">Tạo mật khẩu để hoàn tất đăng ký</p>
            </div>

            {/* Password Warning */}
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-300 text-sm font-bold flex items-center gap-2">
                ⚠️ LƯU Ý QUAN TRỌNG
              </p>
              <p className="text-red-200 text-xs mt-1">
                Vui lòng <strong>KHÔNG</strong> nhập mật khẩu trùng với mật khẩu trong Server KingMC!
                Shop không chịu trách nhiệm về việc mất mật khẩu trong game!
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-bold mb-2">
                <Key className="w-4 h-4" />
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ít nhất 6 ký tự"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:bg-gray-500"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}