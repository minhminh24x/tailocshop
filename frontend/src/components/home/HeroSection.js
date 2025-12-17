import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Decor elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              KHÁM PHÁ KHO BÁU
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
              MEGA EARTH
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-blue-200/80 font-medium mb-10 max-w-3xl mx-auto leading-relaxed">
            Hệ thống vật phẩm thượng hạng, giao dịch tự động, uy tín hàng đầu server.
            <br className="hidden md:block" />
            Nâng tầm trải nghiệm game của bạn ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
            <Link
              to="/items"
              className="relative group px-8 py-4 rounded-full bg-yellow-500 text-slate-900 font-black text-lg shadow-[0_0_40px_rgba(234,179,8,0.4)] overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_60px_rgba(234,179,8,0.6)]"
            >
              <span className="relative z-10">MUA NGAY</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>

            <Link
              to="/contact"
              className="px-8 py-4 rounded-full bg-slate-800/50 backdrop-blur-md border border-white/10 text-white font-bold text-lg hover:bg-slate-800 hover:border-yellow-500/50 transition-all"
            >
              HỖ TRỢ 24/7
            </Link>
          </div>
        </motion.div>

        {/* Stats bar giả lập */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {['10,000+ Khách Hàng', 'Giao Dịch Tự Động', 'Uy Tín 100%'].map((text, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-400 font-semibold uppercase tracking-widest text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {text}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}