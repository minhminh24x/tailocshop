// File: frontend/src/components/order/OrderStatusStepper.js
// Hiển thị tiến trình đơn hàng dạng step-by-step rõ ràng
import React from 'react';
import {
    FaClipboardList,
    FaBoxOpen,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaArrowRight
} from 'react-icons/fa';

// Định nghĩa flow đơn hàng
const ORDER_STEPS = [
    { status: 'PENDING', label: 'Chờ xử lý', icon: FaClipboardList, color: 'yellow' },
    { status: 'PREPARING', label: 'Đang chuẩn bị', icon: FaBoxOpen, color: 'blue' },
    { status: 'READY_FOR_DELIVERY', label: 'Sẵn sàng giao', icon: FaTruck, color: 'purple' },
    { status: 'COMPLETED', label: 'Hoàn thành', icon: FaCheckCircle, color: 'green' },
];

const getStepIndex = (status) => {
    const idx = ORDER_STEPS.findIndex(s => s.status === status);
    return idx >= 0 ? idx : 0;
};

export default function OrderStatusStepper({
    currentStatus,
    isCancelled = false,
    onAdvanceStep,
    isUpdating = false,
    canAdvance = true
}) {
    const currentIndex = getStepIndex(currentStatus);
    const isCompleted = currentStatus === 'COMPLETED';

    if (isCancelled) {
        return (
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-center">
                <FaTimesCircle className="text-5xl text-red-400 mx-auto mb-3" />
                <p className="text-xl font-bold text-red-400">Đơn hàng đã bị hủy</p>
                <p className="text-sm text-gray-400 mt-2">Hàng đã được hoàn trả về kho</p>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-6 text-center">
                <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-3" />
                <p className="text-xl font-bold text-green-400">Đơn hàng đã hoàn thành</p>
                <p className="text-sm text-gray-400 mt-2">Cảm ơn quý khách!</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 text-center">Tiến trình đơn hàng</h3>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8">
                {ORDER_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isPast = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = index > currentIndex;

                    // Màu sắc dựa trên trạng thái
                    let circleClass = 'bg-slate-700 text-gray-500 border-gray-600';
                    let labelClass = 'text-gray-500';

                    if (isPast) {
                        circleClass = 'bg-green-500 text-white border-green-400';
                        labelClass = 'text-green-400';
                    } else if (isCurrent) {
                        circleClass = `bg-${step.color}-500 text-white border-${step.color}-400 ring-4 ring-${step.color}-500/30`;
                        labelClass = `text-${step.color}-400 font-bold`;
                    }

                    // Override với class cứng vì Tailwind không hỗ trợ dynamic class
                    if (isCurrent) {
                        switch (step.color) {
                            case 'yellow':
                                circleClass = 'bg-yellow-500 text-white border-yellow-400 ring-4 ring-yellow-500/30';
                                labelClass = 'text-yellow-400 font-bold';
                                break;
                            case 'blue':
                                circleClass = 'bg-blue-500 text-white border-blue-400 ring-4 ring-blue-500/30';
                                labelClass = 'text-blue-400 font-bold';
                                break;
                            case 'purple':
                                circleClass = 'bg-purple-500 text-white border-purple-400 ring-4 ring-purple-500/30';
                                labelClass = 'text-purple-400 font-bold';
                                break;
                            case 'green':
                                circleClass = 'bg-green-500 text-white border-green-400 ring-4 ring-green-500/30';
                                labelClass = 'text-green-400 font-bold';
                                break;
                            default:
                                break;
                        }
                    }

                    return (
                        <React.Fragment key={step.status}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={`
                  w-14 h-14 rounded-full border-2 flex items-center justify-center 
                  transition-all duration-300 ${circleClass}
                `}>
                                    <Icon className="text-xl" />
                                </div>
                                <p className={`mt-2 text-xs text-center transition-all ${labelClass}`}>
                                    {step.label}
                                </p>
                            </div>

                            {/* Arrow connector (không hiển thị sau step cuối) */}
                            {index < ORDER_STEPS.length - 1 && (
                                <div className="flex-shrink-0 mx-1">
                                    <FaArrowRight className={`text-lg ${index < currentIndex ? 'text-green-400' : 'text-gray-600'
                                        }`} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Action Button */}
            {canAdvance && currentIndex < ORDER_STEPS.length - 1 && onAdvanceStep && (
                <div className="text-center">
                    <button
                        onClick={onAdvanceStep}
                        disabled={isUpdating}
                        className="
              px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-500 hover:to-purple-500
              text-white font-bold rounded-xl 
              shadow-lg shadow-blue-500/25
              transition-all duration-300 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-3 mx-auto
            "
                    >
                        {isUpdating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaArrowRight />
                                Chuyển sang: {ORDER_STEPS[currentIndex + 1]?.label}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
