// File: frontend/src/components/order/OrderTimeline.js
import React from 'react';
import {
    Clock,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    ChefHat
} from 'lucide-react';

/**
 * Component hiển thị timeline trạng thái đơn hàng
 * @param {object} order - Order object với các trường timeline
 */
export default function OrderTimeline({ order }) {
    if (!order) return null;

    const formatDateTime = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Định nghĩa các bước trong timeline
    const steps = [
        {
            key: 'PENDING',
            label: 'Đặt hàng',
            description: 'Đơn hàng đã được tạo',
            icon: Clock,
            time: order.pendingAt || order.createdAt,
            color: 'yellow'
        },
        {
            key: 'PREPARING',
            label: 'Đang chuẩn bị',
            description: 'Shop đang chuẩn bị vật phẩm',
            icon: ChefHat,
            time: order.preparingAt,
            color: 'blue'
        },
        {
            key: 'READY_FOR_DELIVERY',
            label: 'Sẵn sàng giao',
            description: 'Vật phẩm đã sẵn sàng để giao',
            icon: Truck,
            time: order.readyForDeliveryAt,
            color: 'purple'
        },
        {
            key: 'COMPLETED',
            label: 'Hoàn thành',
            description: 'Đơn hàng đã giao thành công',
            icon: CheckCircle,
            time: order.completedAt,
            color: 'green'
        }
    ];

    // Nếu đơn bị hủy, thêm step cancelled
    if (order.status === 'CANCELLED') {
        steps.push({
            key: 'CANCELLED',
            label: 'Đã hủy',
            description: 'Đơn hàng đã bị hủy',
            icon: XCircle,
            time: order.cancelledAt,
            color: 'red'
        });
    }

    // Tìm index của status hiện tại
    const currentStatusIndex = steps.findIndex(s => s.key === order.status);

    const getStepStatus = (index) => {
        if (order.status === 'CANCELLED') {
            // Nếu bị hủy, chỉ highlight step cuối
            return index === steps.length - 1 ? 'current' : 'cancelled';
        }
        if (index < currentStatusIndex) return 'completed';
        if (index === currentStatusIndex) return 'current';
        return 'upcoming';
    };

    const getColorClasses = (color, status) => {
        if (status === 'cancelled') {
            return {
                bg: 'bg-gray-700',
                border: 'border-gray-600',
                text: 'text-gray-500',
                icon: 'text-gray-500'
            };
        }

        if (status === 'upcoming') {
            return {
                bg: 'bg-gray-800',
                border: 'border-gray-600',
                text: 'text-gray-500',
                icon: 'text-gray-500'
            };
        }

        const colors = {
            yellow: {
                bg: 'bg-yellow-900/50',
                border: 'border-yellow-500',
                text: 'text-yellow-400',
                icon: 'text-yellow-400'
            },
            blue: {
                bg: 'bg-blue-900/50',
                border: 'border-blue-500',
                text: 'text-blue-400',
                icon: 'text-blue-400'
            },
            purple: {
                bg: 'bg-purple-900/50',
                border: 'border-purple-500',
                text: 'text-purple-400',
                icon: 'text-purple-400'
            },
            green: {
                bg: 'bg-green-900/50',
                border: 'border-green-500',
                text: 'text-green-400',
                icon: 'text-green-400'
            },
            red: {
                bg: 'bg-red-900/50',
                border: 'border-red-500',
                text: 'text-red-400',
                icon: 'text-red-400'
            }
        };

        return colors[color] || colors.yellow;
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-400" />
                Tiến trình đơn hàng
            </h3>

            <div className="relative">
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const colors = getColorClasses(step.color, status);
                    const Icon = step.icon;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.key} className="flex items-start mb-0">
                            {/* Icon và Line */}
                            <div className="flex flex-col items-center mr-4">
                                {/* Icon Circle */}
                                <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center z-10`}>
                                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                                </div>
                                {/* Connector Line */}
                                {!isLast && (
                                    <div className={`w-0.5 h-16 ${status === 'completed' ? 'bg-gray-600' : 'bg-gray-700'}`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-semibold ${status === 'upcoming' ? 'text-gray-500' : 'text-white'}`}>
                                        {step.label}
                                    </h4>
                                    {step.time && status !== 'upcoming' && (
                                        <span className={`text-xs ${colors.text}`}>
                                            {formatDateTime(step.time)}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm mt-1 ${status === 'upcoming' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {step.description}
                                </p>

                                {/* Current status indicator */}
                                {status === 'current' && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.bg.replace('/50', '')} opacity-75`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.bg.replace('/50', '')}`}></span>
                                        </span>
                                        <span className={`text-xs ${colors.text}`}>Đang xử lý</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
