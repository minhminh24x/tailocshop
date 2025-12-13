// File: frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { FaCoins } from 'react-icons/fa';
import { getDashboardStats, getRecentOrders, getLowStockItems } from '../../services/adminStatsService';
import { formatNumber } from '../../utils/formatNumber';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, ordersRes, stockRes] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
        getLowStockItems(10, 5)
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setLowStockItems(stockRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Không thể tải dữ liệu dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh mỗi 5 phút
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-600 text-yellow-100';
      case 'COMPLETED': return 'bg-green-600 text-green-100';
      case 'CANCELLED': return 'bg-red-600 text-red-100';
      case 'PREPARING': return 'bg-blue-600 text-blue-100';
      case 'READY_FOR_DELIVERY': return 'bg-cyan-600 text-cyan-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
        <span className="ml-3 text-gray-300">Đang tải dashboard...</span>
      </div>
    );
  }

  const statCards = stats ? [
    {
      title: 'Tổng Đơn hàng',
      value: formatNumber(stats.orders.total),
      subValue: `${stats.orders.thisMonth} tháng này`,
      change: `${stats.orders.changePercent >= 0 ? '+' : ''}${stats.orders.changePercent}%`,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/admin/orders'
    },
    {
      title: 'Khách hàng',
      value: formatNumber(stats.customers.total),
      subValue: `+${stats.customers.newThisMonth} mới`,
      change: `${stats.customers.changePercent >= 0 ? '+' : ''}${stats.customers.changePercent}%`,
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/manage-customers'
    },
    {
      title: 'Doanh thu (Xu)',
      value: formatNumber(stats.revenue.coinThisMonth),
      subValue: stats.revenue.usdThisMonth > 0 ? `+ $${formatNumber(stats.revenue.usdThisMonth)}` : 'Tháng này',
      change: `${stats.revenue.changePercent >= 0 ? '+' : ''}${stats.revenue.changePercent}%`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/admin/orders'
    },
    {
      title: 'Tồn kho',
      value: formatNumber(stats.inventory.totalStock),
      subValue: stats.inventory.lowStockCount > 0 ? `${stats.inventory.lowStockCount} sắp hết` : 'Đủ hàng',
      change: stats.inventory.lowStockCount > 0 ? 'Cảnh báo' : 'Ổn định',
      icon: Package,
      color: stats.inventory.lowStockCount > 0 ? 'bg-red-500' : 'bg-pink-500',
      link: '/admin/items'
    },
  ] : [];

  const quickActions = [
    { title: 'Duyệt đơn hàng', link: '/admin/orders', icon: Clock, color: 'bg-indigo-600', badge: stats?.orders.pending || 0 },
    { title: 'Thêm vật phẩm', link: '/admin/items', icon: Package, color: 'bg-pink-600' },
    { title: 'Quản lý VIP', link: '/admin/vip-levels', icon: TrendingUp, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Tổng quan (Dashboard)</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <span className="text-gray-400 text-sm">
            Cập nhật: {lastUpdated?.toLocaleTimeString('vi-VN') || 'Chưa có'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            to={stat.link}
            key={index}
            className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.change.includes('+') ? 'text-green-400' :
                  stat.change.includes('-') ? 'text-red-400' :
                    stat.change === 'Cảnh báo' ? 'text-red-400' : 'text-gray-400'
                }`}>
                {stat.change}
              </span>
              <span className="text-gray-500 ml-2">so với tháng trước</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Đơn hàng gần đây</h2>
            {stats?.orders.pending > 0 && (
              <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs font-bold">
                {stats.orders.pending} chờ xử lý
              </span>
            )}
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                to={`/admin/orders/${order.id}`}
                key={order.id}
                className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 font-bold text-sm">
                  {order.customer?.inGameName?.substring(0, 2).toUpperCase() || 'KH'}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-white">
                    Đơn #{order.orderNumber || order.id.substring(0, 8)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString('vi-VN')} • {order.customer?.inGameName || 'Khách'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-400 flex items-center justify-end">
                    <FaCoins className="mr-1" size={12} />
                    {formatNumber(parseFloat(order.totalAmountCoin) || 0)}
                  </p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-gray-500 py-4">Chưa có đơn hàng nào</p>
            )}
            <div className="text-center pt-2">
              <Link to="/admin/orders" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Xem tất cả đơn hàng &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`flex items-center justify-between p-4 rounded-lg text-white transition-transform hover:scale-105 ${action.color}`}
                >
                  <div className="flex items-center">
                    <action.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  {action.badge > 0 && (
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
                      {action.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-gray-900 rounded-xl shadow-lg border border-red-900 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-white">Sắp hết hàng</h2>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-300 truncate flex-1">{item.name}</span>
                    <span className="text-red-400 font-bold text-sm ml-2">
                      {item.stockQuantity}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/admin/items"
                className="block text-center text-red-400 hover:text-red-300 text-sm mt-3"
              >
                Quản lý kho &rarr;
              </Link>
            </div>
          )}

          {/* System Status */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Hệ thống</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Server Status</span>
                <span className="text-green-400 font-medium">Online</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Database</span>
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>API Version</span>
                <span className="text-gray-300">v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}