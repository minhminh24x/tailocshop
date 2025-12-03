// File: frontend/src/pages/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  // Mock data cho stats (Sau này sẽ fetch từ API)
  const stats = [
    {
      title: 'Tổng Đơn hàng',
      value: '1,234',
      change: '+12%',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/admin/orders'
    },
    {
      title: 'Khách hàng mới',
      value: '56',
      change: '+5%',
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/manage-customers'
    },
    {
      title: 'Doanh thu (Xu)',
      value: '5.4M',
      change: '+18%',
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/admin/orders'
    },
    {
      title: 'Vật phẩm tồn kho',
      value: '892',
      change: '-2%',
      icon: Package,
      color: 'bg-pink-500',
      link: '/admin/items'
    },
  ];

  const quickActions = [
    { title: 'Duyệt đơn hàng', link: '/admin/orders', icon: Clock, color: 'bg-indigo-600' },
    { title: 'Thêm vật phẩm', link: '/admin/items', icon: Package, color: 'bg-pink-600' },
    { title: 'Xem báo cáo', link: '/admin/dashboard', icon: TrendingUp, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Tổng quan (Dashboard)</h1>
        <span className="text-gray-400 text-sm">Cập nhật lần cuối: Vừa xong</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            to={stat.link}
            key={index}
            className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 ml-2">so với tháng trước</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / Quick Actions */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {/* Mock Activity Items */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 font-bold">
                  DH
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-white">Đơn hàng #ORD-{1000 + i} vừa được tạo</p>
                  <p className="text-xs text-gray-400">2 phút trước • Khách hàng: User{i}</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-yellow-900 text-yellow-200 rounded-full">
                  Chờ xử lý
                </span>
              </div>
            ))}
            <div className="text-center pt-2">
              <Link to="/admin/orders" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Xem tất cả hoạt động &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`flex items-center p-4 rounded-lg text-white transition-transform hover:scale-105 ${action.color}`}
              >
                <action.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{action.title}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Hệ thống</h3>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Server Status</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Database</span>
              <span className="text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}