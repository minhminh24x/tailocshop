import React from 'react';
import { LifeBuoy, Mail, Phone } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center text-center">
        <LifeBuoy className="text-green-500 mb-4" size={64} />
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Trung Tâm Hỗ Trợ</h1>
        <p className="text-lg text-gray-600 mb-8">
          Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn!
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Liên hệ với chúng tôi</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin liên hệ */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="text-green-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">Bạn có thể gửi email cho chúng tôi bất cứ lúc nào.</p>
                <a href="mailto:hotro@tailocshop.com" className="text-green-600 hover:underline">
                  hotro@tailocshop.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="text-green-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold">Hotline</h3>
                <p className="text-gray-600">Gọi cho chúng tôi trong giờ hành chính (8:00 - 17:00).</p>
                <a href="tel:19001234" className="text-green-600 hover:underline">
                  1900 1234
                </a>
              </div>
            </div>
          </div>

          {/* Form liên hệ (để phát triển sau) */}
          <div>
            <h3 className="font-semibold mb-2">Hoặc gửi tin nhắn trực tiếp</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ tên</label>
                <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Nguyễn Văn A" />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="bạn@email.com" />
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Tin nhắn</label>
                <textarea id="message" rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Nội dung bạn cần hỗ trợ..."></textarea>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-semibold">
                Gửi Hỗ Trợ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;